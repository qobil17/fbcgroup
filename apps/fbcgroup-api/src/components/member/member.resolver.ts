import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Member, Members } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { MAX_UPLOAD_FILES, saveImage } from '../../libs/image';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { Message } from '../../libs/enums/common.enum';
import { OrderServiceService } from '../orderservice/orderservice.service';
import { Order, Orders } from '../../libs/dto/orderService/order';
import { OrderInput, OrdersInquiry } from '../../libs/dto/orderService/order.input';
import { OrderUpdate } from '../../libs/dto/orderService/order.update';

@Resolver()
export class MemberResolver {
	constructor(
		private readonly memberService: MemberService,
		private readonly orderService: OrderServiceService,
	) {}

	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		return await this.memberService.signup(input);
	}

	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		return await this.memberService.login(input);
	}

	@Roles(MemberType.USER)
	@UseGuards(AuthGuard)
	@Mutation(() => Member)
	public async updateMember(
		@Args('input') input: MemberUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.memberService.updateMember(memberId, input);
	}

	@Roles(MemberType.USER)
	@UseGuards(AuthGuard)
	@Query(() => Member)
	public async getMember(@Args('memberId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Member> {
		const targetId = shapeIntoMongoObjectId(input);
		return await this.memberService.getMember(memberId, targetId);
	}

	// AUTH MEMBER

	@Roles(MemberType.USER)
	@UseGuards(AuthGuard)
	@Query(() => String)
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		return `Hi ${memberNick}`;
	}

	@Roles(MemberType.USER)
	@UseGuards(RolesGuard)
	@Query(() => String)
	public async checkAuthRoles(@AuthMember() AuthMember: Member): Promise<string> {
		return `Hi ${AuthMember.memberNick}, you are ${AuthMember.memberType} (memberId: ${AuthMember._id})`;
	}

	@Roles(MemberType.USER)
	@UseGuards(RolesGuard)
	@Mutation(() => Order)
	public async createOrder(
		@Args('input') input: OrderInput,
		@AuthMember('_id') memberId: ObjectId,
		@AuthMember('memberStatus') memberStatus: MemberStatus,
	): Promise<Order> {
		if (memberStatus === MemberStatus.BLOCK) {
			throw new ForbiddenException(Message.BLOCKED_USER);
		}
		input.memberId = memberId;
		return await this.orderService.createOrder(input);
	}

	@Roles(MemberType.USER)
	@UseGuards(RolesGuard)
	@Query(() => Order)
	public async getOrder(@Args('orderId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Order> {
		const orderId = shapeIntoMongoObjectId(input);
		return await this.orderService.getOrder(memberId, orderId);
	}

	@Roles(MemberType.USER)
	@UseGuards(RolesGuard)
	@Query(() => Orders)
	public async myOrder(@AuthMember('_id') memberId: ObjectId): Promise<Orders> {
		return this.orderService.myOrder(memberId);
	}

	@Roles(MemberType.USER)
	@UseGuards(AuthGuard)
	@Mutation(() => Order)
	public async updateOrder(@Args('input') input: OrderUpdate, @AuthMember('_id') memberId: ObjectId): Promise<Order> {
		input.orderId = shapeIntoMongoObjectId(input.orderId);
		return await this.orderService.updateOrder(memberId, input);
	}

	// * ADMIN *//

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Members)
	public async getAllMembersByAdmin(@Args('input') input: MembersInquiry): Promise<Members> {
		return await this.memberService.getAllMembersByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Order)
	public async updateOrderByAdmin(@Args('input') input: OrderUpdate): Promise<Order> {
		input.orderId = shapeIntoMongoObjectId(input.orderId);
		return await this.orderService.updateOrderByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(AuthGuard, RolesGuard)
	@Query((returns) => Orders)
	public async getAllOrdersByAdmin(
		@Args('input') input: OrdersInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Orders> {
		return await this.orderService.getAllOrdersByAdmin(input, memberId);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Member)
	public async updateMemberByAdmin(@Args('input') input: MemberUpdate): Promise<Member> {
		return await this.memberService.updateMemberByAdmin(input);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => String)
	public async imageUploader(
		@Args({ name: 'file', type: () => GraphQLUpload })
		{ createReadStream, filename, mimetype }: FileUpload,
		@Args('target') target: String,
	): Promise<string> {
		if (!filename) throw new Error(Message.UPLOAD_FAILED);
		return await saveImage(createReadStream, mimetype, String(target));
	}

	// Bir nechta rasm: bittasi xato bo'lsa ham, qaysi rasm ekanini aytib to'xtaydi
	@UseGuards(AuthGuard)
	@Mutation((returns) => [String])
	public async imagesUploader(
		@Args('files', { type: () => [GraphQLUpload] })
		files: Promise<FileUpload>[],
		@Args('target') target: String,
	): Promise<string[]> {
		if (files.length > MAX_UPLOAD_FILES) throw new Error(`Bir martada ${MAX_UPLOAD_FILES} tagacha rasm yuklash mumkin`);
		const uploaded: string[] = [];
		for (const [index, img] of files.entries()) {
			const { filename, mimetype, createReadStream } = await img;
			try {
				uploaded.push(await saveImage(createReadStream, mimetype, String(target)));
			} catch (err) {
				throw new Error(`${index + 1}-rasm (${filename}): ${err.message}`);
			}
		}
		return uploaded;
	}
}
