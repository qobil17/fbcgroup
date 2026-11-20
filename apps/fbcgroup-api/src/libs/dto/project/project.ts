import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsUrl, Length, Max, Min, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ObjectId } from 'mongoose';
import { ServiceCollection } from '../../enums/service.enum';
import { PartnerStatus, ProjectStatus } from '../../enums/project.enum';
import { TotalCounter } from '../member/member';

// ===================== PROJECT =====================

@ObjectType()
export class Project {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	projectTitle: string;

	@Field(() => String)
	projectDesc: string;

	@Field(() => ServiceCollection, { nullable: true })
	projectCollection?: ServiceCollection;

	@Field(() => String, { nullable: true })
	projectLocation?: string;

	@Field(() => Date, { nullable: true })
	projectDate?: Date;

	@Field(() => [String])
	projectImages: string[];

	@Field(() => ProjectStatus)
	projectStatus: ProjectStatus;

	@Field(() => Int)
	projectViews: number;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class Projects {
	@Field(() => [Project])
	list: Project[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

@InputType()
export class ProjectInput {
	@IsNotEmpty()
	@Length(3, 200)
	@Field(() => String)
	projectTitle: string;

	@IsNotEmpty()
	@Length(10, 20000)
	@Field(() => String)
	projectDesc: string;

	@IsOptional()
	@Field(() => ServiceCollection, { nullable: true })
	projectCollection?: ServiceCollection;

	@IsOptional()
	@Length(0, 200)
	@Field(() => String, { nullable: true })
	projectLocation?: string;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	projectDate?: Date;

	@ArrayMinSize(1)
	@ArrayMaxSize(30)
	@Field(() => [String])
	projectImages: string[];

	@IsOptional()
	@Field(() => ProjectStatus, { nullable: true })
	projectStatus?: ProjectStatus;
}

@InputType()
export class ProjectUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Length(3, 200)
	@Field(() => String, { nullable: true })
	projectTitle?: string;

	@IsOptional()
	@Length(10, 20000)
	@Field(() => String, { nullable: true })
	projectDesc?: string;

	@IsOptional()
	@Field(() => ServiceCollection, { nullable: true })
	projectCollection?: ServiceCollection;

	@IsOptional()
	@Length(0, 200)
	@Field(() => String, { nullable: true })
	projectLocation?: string;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	projectDate?: Date;

	@IsOptional()
	@ArrayMinSize(1)
	@ArrayMaxSize(30)
	@Field(() => [String], { nullable: true })
	projectImages?: string[];

	@IsOptional()
	@Field(() => ProjectStatus, { nullable: true })
	projectStatus?: ProjectStatus;
}

@InputType()
export class ProjectsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Max(50)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => ServiceCollection, { nullable: true })
	projectCollection?: ServiceCollection;

	// faqat admin uchun ma'noli: yashirin loyihalarni ham ko'rish
	@IsOptional()
	@Field(() => ProjectStatus, { nullable: true })
	projectStatus?: ProjectStatus;
}

// ===================== PARTNER =====================

@ObjectType()
export class Partner {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	partnerName: string;

	@Field(() => String)
	partnerLogo: string;

	@Field(() => String, { nullable: true })
	partnerLink?: string;

	@Field(() => String, { nullable: true })
	partnerDesc?: string;

	@Field(() => Int)
	partnerOrder: number;

	@Field(() => PartnerStatus)
	partnerStatus: PartnerStatus;

	@Field(() => Date)
	createdAt: Date;
}

@InputType()
export class PartnerInput {
	@IsNotEmpty()
	@Length(2, 120)
	@Field(() => String)
	partnerName: string;

	@IsNotEmpty()
	@Field(() => String)
	partnerLogo: string;

	@IsOptional()
	@IsUrl({ require_protocol: true }, { message: 'Sayt manzili https:// bilan boshlanishi kerak' })
	@Field(() => String, { nullable: true })
	partnerLink?: string;

	@IsOptional()
	@Length(0, 300)
	@Field(() => String, { nullable: true })
	partnerDesc?: string;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	partnerOrder?: number;

	@IsOptional()
	@IsIn(Object.values(PartnerStatus))
	@Field(() => PartnerStatus, { nullable: true })
	partnerStatus?: PartnerStatus;
}

@InputType()
export class PartnerUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Length(2, 120)
	@Field(() => String, { nullable: true })
	partnerName?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	partnerLogo?: string;

	@IsOptional()
	@IsUrl({ require_protocol: true }, { message: 'Sayt manzili https:// bilan boshlanishi kerak' })
	@Field(() => String, { nullable: true })
	partnerLink?: string;

	@IsOptional()
	@Length(0, 300)
	@Field(() => String, { nullable: true })
	partnerDesc?: string;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	partnerOrder?: number;

	@IsOptional()
	@Field(() => PartnerStatus, { nullable: true })
	partnerStatus?: PartnerStatus;
}
