import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import {
	Partner,
	PartnerInput,
	PartnerUpdate,
	Project,
	ProjectInput,
	Projects,
	ProjectsInquiry,
	ProjectUpdate,
} from '../../libs/dto/project/project';
import { Message } from '../../libs/enums/common.enum';
import { PartnerStatus, ProjectStatus } from '../../libs/enums/project.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class ProjectService {
	constructor(
		@InjectModel('Project') private readonly projectModel: Model<Project>,
		@InjectModel('Partner') private readonly partnerModel: Model<Partner>,
	) {}

	// ===================== PROJECTS =====================

	private async listProjects(input: ProjectsInquiry, match: T): Promise<Projects> {
		const { page, limit, projectCollection } = input;
		if (projectCollection) match.projectCollection = projectCollection;
		const [result] = await this.projectModel
			.aggregate([
				{ $match: match },
				{ $sort: { projectDate: -1, createdAt: -1 } },
				{
					$facet: {
						list: [{ $skip: (page - 1) * limit }, { $limit: limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		return result ?? { list: [], metaCounter: [] };
	}

	public async getProjects(input: ProjectsInquiry): Promise<Projects> {
		return this.listProjects(input, { projectStatus: ProjectStatus.ACTIVE });
	}

	public async getAllProjectsByAdmin(input: ProjectsInquiry): Promise<Projects> {
		const match: T = {};
		if (input.projectStatus) match.projectStatus = input.projectStatus;
		return this.listProjects(input, match);
	}

	public async getProject(projectId: ObjectId): Promise<Project> {
		const project = await this.projectModel
			.findOneAndUpdate(
				{ _id: projectId, projectStatus: ProjectStatus.ACTIVE },
				{ $inc: { projectViews: 1 } },
				{ new: true },
			)
			.lean()
			.exec();
		if (!project) throw new NotFoundException(Message.NO_DATA_FOUND);
		return project as Project;
	}

	public async createProject(input: ProjectInput): Promise<Project> {
		try {
			return await this.projectModel.create({ ...input, projectStatus: input.projectStatus ?? ProjectStatus.ACTIVE });
		} catch (err) {
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async updateProject(input: ProjectUpdate): Promise<Project> {
		const { _id, ...rest } = input;
		const result = await this.projectModel.findByIdAndUpdate(_id, rest, { new: true }).lean().exec();
		if (!result) throw new BadRequestException(Message.UPDATE_FAILED);
		return result as Project;
	}

	public async removeProjectByAdmin(projectId: ObjectId): Promise<Project> {
		const result = await this.projectModel.findByIdAndDelete(projectId).lean().exec();
		if (!result) throw new BadRequestException(Message.REMOVE_FAILED);
		return result as Project;
	}

	// ===================== PARTNERS =====================

	public async getPartners(): Promise<Partner[]> {
		return (await this.partnerModel
			.find({ partnerStatus: PartnerStatus.ACTIVE })
			.sort({ partnerOrder: 1, createdAt: 1 })
			.lean()
			.exec()) as Partner[];
	}

	public async getAllPartnersByAdmin(): Promise<Partner[]> {
		return (await this.partnerModel.find().sort({ partnerOrder: 1, createdAt: 1 }).lean().exec()) as Partner[];
	}

	public async createPartner(input: PartnerInput): Promise<Partner> {
		try {
			return await this.partnerModel.create(input);
		} catch (err) {
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async updatePartner(input: PartnerUpdate): Promise<Partner> {
		const { _id, ...rest } = input;
		const result = await this.partnerModel.findByIdAndUpdate(_id, rest, { new: true }).lean().exec();
		if (!result) throw new BadRequestException(Message.UPDATE_FAILED);
		return result as Partner;
	}

	public async removePartnerByAdmin(partnerId: ObjectId): Promise<Partner> {
		const result = await this.partnerModel.findByIdAndDelete(partnerId).lean().exec();
		if (!result) throw new BadRequestException(Message.REMOVE_FAILED);
		return result as Partner;
	}
}
