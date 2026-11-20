import { Schema } from 'mongoose';
import { ServiceCollection } from '../libs/enums/service.enum';
import { ProjectStatus } from '../libs/enums/project.enum';

// Qilingan ish hisoboti: sarlavha, matn, rasmlar, joy va sana
const ProjectSchema = new Schema(
	{
		projectTitle: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
		projectDesc: { type: String, required: true },
		projectCollection: { type: String, enum: ServiceCollection },
		projectLocation: { type: String, trim: true },
		projectDate: { type: Date },
		projectImages: { type: [String], default: [] },
		projectStatus: { type: String, enum: ProjectStatus, default: ProjectStatus.ACTIVE },
		projectViews: { type: Number, default: 0, min: 0 },
	},
	{ timestamps: true, collection: 'projects' },
);

ProjectSchema.index({ projectStatus: 1, projectDate: -1, createdAt: -1 });

export default ProjectSchema;
