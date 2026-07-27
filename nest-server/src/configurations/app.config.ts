import {registerAs} from "@nestjs/config";
import Joi from "joi";
import validateConfig from "./_config.validator";


export default registerAs("app", () => {
  return validateConfig(
    {
      server_port: parseInt(process.env.SERVER_PORT!, 10) || 3000,
    },

    Joi.object({
      server_port: Joi.number().required(),
    })
  )
})