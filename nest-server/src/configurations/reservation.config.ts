import { registerAs } from '@nestjs/config';
import Joi from 'joi';
import validateConfig from './_config.validator';

export default registerAs('reservation', () => {
  return validateConfig(
    {
      prevent_cancellation_before_minutes:
        parseInt(process.env.PREVENT_CANCELLATION_BEFORE_MINUTES!, 10) || 15,
      notify_before_minutes:
        parseInt(process.env.NOTIFY_BEFORE_MINUTES!, 10) || 10,
    },

    Joi.object({
      prevent_cancellation_before_minutes: Joi.number().required(),
      notify_before_minutes: Joi.number().required(),
    }),
  );
});
