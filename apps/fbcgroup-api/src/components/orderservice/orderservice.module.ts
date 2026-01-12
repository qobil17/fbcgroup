import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OrderServiceService } from './orderservice.service';
import OrderSchema from '../../schemas/Order.model';
import OrderServiceSchema from '../../schemas/OrderService.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Order', schema: OrderSchema },
			{ name: 'OrderItem', schema: OrderServiceSchema },
		]),
	],
	providers: [OrderServiceService],
	exports: [OrderServiceService],
})
export class OrderServiceModule {}
