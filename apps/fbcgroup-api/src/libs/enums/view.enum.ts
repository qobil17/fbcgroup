import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	PRODUCT = 'PRODUCT',
	SERVICE = 'SERVICE',
}

registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
