import { ObjectId } from 'bson';

export const availableMemberSorts = ['createdAt', 'updatedat'];

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};
