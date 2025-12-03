import { registerEnumType } from '@nestjs/graphql';

export enum ServiceCollection {
	ALIF = 'ALIF LIGHT',
	HPLINE = 'HPLINE',
}

registerEnumType(ServiceCollection, {
	name: 'ServiceCollection',
});

export enum ProductType {
	HPL = 'HPL',
	ALIKAFON = 'ALIKAFON',
	GRANITE = 'GRANITE',
	SERANIT = 'SERANIT',
	LED = 'LED',
	OFFICE = 'OFFICE',
	DECORATIVE = 'DECORATIVE',
	EMERGENCY_LIGHT = 'EMERGENCY_LIGHT',
}

registerEnumType(ProductType, {
	name: 'ProductType',
});

export enum ServiceType {
	DELIVERY = 'DELIVERY',
	INSTALLATION = 'INSTALLATION',
	FULL_PROJECT = 'FULL PROJECT',
}

registerEnumType(ServiceType, {
	name: 'ServiceType',
});

export enum ServiceArea {
	INTERIOR = 'INTERIOR',
	EXTERIOR = 'EXTERIOR',
}

registerEnumType(ServiceArea, {
	name: 'ServiceArea',
});
