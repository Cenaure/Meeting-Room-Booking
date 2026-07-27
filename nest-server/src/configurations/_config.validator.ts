import {ObjectSchema} from "joi";

const validateConfig = (
  config: Record<string, any>,
  validationSchema: ObjectSchema
): Record<string, any> => {
  const { error, value } = validationSchema.validate(config, {
    abortEarly: false,
  });

  if (error) {
    throw new Error(
      `Environment variables validation error: ${error.message}`
    );
  }

  return value as Record<string, any>;
}

export default validateConfig;