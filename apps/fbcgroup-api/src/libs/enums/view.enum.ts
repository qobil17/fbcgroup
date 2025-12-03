import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	PRODUCT = 'PRODUCT',
}

registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
