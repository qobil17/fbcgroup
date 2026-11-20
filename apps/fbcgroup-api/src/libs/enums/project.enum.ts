import { registerEnumType } from '@nestjs/graphql';

// Loyiha (qilingan ish hisoboti) holati
export enum ProjectStatus {
	ACTIVE = 'ACTIVE', // saytda ko'rinadi
	HIDDEN = 'HIDDEN', // qoralama / yashirin
}
registerEnumType(ProjectStatus, { name: 'ProjectStatus' });

// Hamkor holati
export enum PartnerStatus {
	ACTIVE = 'ACTIVE',
	HIDDEN = 'HIDDEN',
}
registerEnumType(PartnerStatus, { name: 'PartnerStatus' });
