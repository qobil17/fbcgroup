import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
	PAUSE = 'PAUSE',
	PROCESS = 'PROCESS',
	FINISH = 'FINISH',
	CANCELLED = 'CANCELLED',
}

registerEnumType(OrderStatus, {
	name: 'OrderStatus',
});
