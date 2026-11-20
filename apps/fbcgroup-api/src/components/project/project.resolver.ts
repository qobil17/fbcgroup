import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
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
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class ProjectResolver {
	constructor(private readonly projectService: ProjectService) {}

	// ===================== OMMAVIY (sayt) =====================

	@Query(() => Projects)
	public async getProjects(@Args('input') input: ProjectsInquiry): Promise<Projects> {
		return this.projectService.getProjects(input);
	}

	@Query(() => Project)
	public async getProject(@Args('projectId') projectId: string): Promise<Project> {
		return this.projectService.getProject(shapeIntoMongoObjectId(projectId));
	}

	@Query(() => [Partner])
	public async getPartners(): Promise<Partner[]> {
		return this.projectService.getPartners();
	}

	// ===================== ADMIN =====================

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Projects)
	public async getAllProjectsByAdmin(@Args('input') input: ProjectsInquiry): Promise<Projects> {
		return this.projectService.getAllProjectsByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Project)
	public async createProject(@Args('input') input: ProjectInput): Promise<Project> {
		return this.projectService.createProject(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Project)
	public async updateProject(@Args('input') input: ProjectUpdate): Promise<Project> {
		input._id = shapeIntoMongoObjectId(input._id);
		return this.projectService.updateProject(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Project)
	public async removeProjectByAdmin(@Args('projectId') projectId: string): Promise<Project> {
		return this.projectService.removeProjectByAdmin(shapeIntoMongoObjectId(projectId));
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => [Partner])
	public async getAllPartnersByAdmin(): Promise<Partner[]> {
		return this.projectService.getAllPartnersByAdmin();
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Partner)
	public async createPartner(@Args('input') input: PartnerInput): Promise<Partner> {
		return this.projectService.createPartner(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Partner)
	public async updatePartner(@Args('input') input: PartnerUpdate): Promise<Partner> {
		input._id = shapeIntoMongoObjectId(input._id);
		return this.projectService.updatePartner(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Partner)
	public async removePartnerByAdmin(@Args('partnerId') partnerId: string): Promise<Partner> {
		return this.projectService.removePartnerByAdmin(shapeIntoMongoObjectId(partnerId));
	}
}
