import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
	NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
	PORT_API: Joi.number().default(3000),
	SECRET_TOKEN: Joi.string().min(32).required(),
	MONGO_DEV: Joi.string().when('NODE_ENV', {
		is: Joi.not('production'),
		then: Joi.required(),
		otherwise: Joi.optional(),
	}),
	MONGO_PROD: Joi.string().when('NODE_ENV', {
		is: 'production',
		then: Joi.required(),
		otherwise: Joi.optional(),
	}),
	ALLOWED_ORIGINS: Joi.string().default('http://localhost:3007'),
});
