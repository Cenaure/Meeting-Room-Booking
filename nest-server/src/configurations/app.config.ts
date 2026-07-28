import {registerAs} from "@nestjs/config";
import Joi from "joi";
import validateConfig from "./_config.validator";


export default registerAs("app", () => {
  return validateConfig(
    {
      node_env: process.env.NODE_ENV || "development",
      server_port: parseInt(process.env.SERVER_PORT!, 10) || 3000,
    },

    Joi.object({
      node_env: Joi.string().valid("development", "production", "test").required(),
      server_port: Joi.number().required(),
    })
  )
})