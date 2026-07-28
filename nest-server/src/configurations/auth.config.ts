import {registerAs} from "@nestjs/config";
import validateConfig from "./_config.validator";
import Joi from "joi";

export default registerAs("auth", () => {
  return validateConfig(
    {
      access_token_ttl: parseInt(process.env.ACCESS_TOKEN_TTL!, 10),
      refresh_token_ttl: parseInt(process.env.REFRESH_TOKEN_TTL!, 10),
      access_token_secret: process.env.ACCESS_TOKEN_SECRET!,
      refresh_token_secret: process.env.REFRESH_TOKEN_SECRET!,
    },

    Joi.object({
      access_token_ttl: Joi.number().required(),
      refresh_token_ttl: Joi.number().required(),
      access_token_secret: Joi.string().required(),
      refresh_token_secret: Joi.string().required(),
    })
  )
})