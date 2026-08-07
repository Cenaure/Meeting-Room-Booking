import {registerAs} from "@nestjs/config";
import Joi from "joi";
import validateConfig from "./_config.validator";


export default registerAs("db", () => {
  return validateConfig(
    {
      url: process.env.DATABASE_URL!,
    },

    Joi.object({
      url: Joi.string().required(),
    })
  )
})