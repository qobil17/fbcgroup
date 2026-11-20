import { registerEnumType } from '@nestjs/graphql';

// Hamkor holati
export enum PartnerStatus {
	ACTIVE = 'ACTIVE', // saytda ko'rinadi
	HIDDEN = 'HIDDEN', // yashirin
}
registerEnumType(PartnerStatus, { name: 'PartnerStatus' });
