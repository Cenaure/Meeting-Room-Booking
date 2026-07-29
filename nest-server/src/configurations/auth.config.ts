import {registerAs} from "@nestjs/config";
import validateConfig from "./_config.validator";
import Joi from "joi";

export default registerAs("auth", () => {
  return validateConfig(
    {
      access_token_ttl: parseInt(process.env.ACCESS_TOKEN_TTL!, 10),
      refresh_token_ttl: parseInt(process.env.REFRESH_TOKEN_TTL!, 10),
      activation_link_ttl: parseInt(process.env.ACTIVATION_LINK_TTL!, 10),
      access_token_secret: process.env.ACCESS_TOKEN_SECRET!,
      refresh_token_secret: process.env.REFRESH_TOKEN_SECRET!,
      google_client_id: process.env.GOOGLE_CLIENT_ID!,
      google_client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      google_callback_url: process.env.GOOGLE_CALLBACK_URL!,
    },

    Joi.object({
      access_token_ttl: Joi.number().required(),
      refresh_token_ttl: Joi.number().required(),
      activation_link_ttl: Joi.number().required(),
      access_token_secret: Joi.string().required(),
      refresh_token_secret: Joi.string().required(),
      google_client_id: Joi.string().required(),
      google_client_secret: Joi.string().required(),
      google_callback_url: Joi.string().required(),
    })
  )
})