import { registerAs } from '@nestjs/config';
import Joi from 'joi';
import validateConfig from './_config.validator';

export default registerAs('redis', () => {
  return validateConfig(
    {
      port: parseInt(process.env.REDIS_PORT!, 10),
      host: process.env.REDIS_HOST!,
      password: process.env.REDIS_PASSWORD!,
    },

    Joi.object({
      port: Joi.number().required(),
      host: Joi.string().required(),
      password: Joi.string(),
    }),
  );
});
