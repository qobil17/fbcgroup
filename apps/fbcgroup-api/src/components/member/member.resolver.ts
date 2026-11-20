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
import { getSerialForImage, shapeIntoMongoObjectId, validMimeTypes } from '../../libs/config';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream, mkdirSync } from 'fs';
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
		const validMime = validMimeTypes.includes(mimetype);
		if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

		const imageName = getSerialForImage(filename);
		const dir = `uploads/${target}`;
		mkdirSync(dir, { recursive: true });
		const url = `${dir}/${imageName}`;
		const stream = createReadStream();

		await new Promise<void>((resolve, reject) => {
			stream
				.pipe(createWriteStream(url))
				.on('finish', () => resolve())
				.on('error', (err) => reject(new Error(`${Message.UPLOAD_FAILED}: ${err.message}`)));
		});

		return url;
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => [String])
	public async imagesUploader(
		@Args('files', { type: () => [GraphQLUpload] })
		files: Promise<FileUpload>[],
		@Args('target') target: String,
	): Promise<string[]> {
		const uploadedImages = [];
		const promisedList = files.map(async (img: Promise<FileUpload>, index: number): Promise<Promise<void>> => {
			try {
				const { filename, mimetype, encoding, createReadStream } = await img;

				const validMime = validMimeTypes.includes(mimetype);
				if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

				const imageName = getSerialForImage(filename);
				const dir = `uploads/${target}`;
				mkdirSync(dir, { recursive: true });
				const url = `${dir}/${imageName}`;
				const stream = createReadStream();

				await new Promise<void>((resolve, reject) => {
					stream
						.pipe(createWriteStream(url))
						.on('finish', () => resolve())
						.on('error', (err) => reject(new Error(`${Message.UPLOAD_FAILED}: ${err.message}`)));
				});

				uploadedImages[index] = url;
			} catch (err) {
				// Individual file failure is swallowed so remaining uploads complete
			}
		});

		await Promise.all(promisedList);
		return uploadedImages;
	}
}
