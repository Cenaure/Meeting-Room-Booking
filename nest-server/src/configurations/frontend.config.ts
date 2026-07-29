import {registerAs} from "@nestjs/config";
import Joi from "joi";
import validateConfig from "./_config.validator";


export default registerAs("frontend", () => {
  return validateConfig(
    {
      domain: process.env.DOMAIN!,
      client_url: process.env.CLIENT_URL!,
      profile_route: process.env.PROFILE_ROUTE!,
    },

    Joi.object({
      domain: Joi.string().required(),
      client_url: Joi.string().required(),
      profile_route: Joi.string().required(),
    })
  )
})