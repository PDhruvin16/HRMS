import { FieldValues, Resolver, FieldErrors } from 'react-hook-form';
import * as yup from 'yup';

/**
 * A custom Yup resolver for React Hook Form.
 * Bridges Yup schemas to RHF without needing @hookform/resolvers package.
 */
export const yupResolver =
  <T extends FieldValues>(schema: yup.ObjectSchema<T>): Resolver<T> =>
  async (values) => {
    try {
      const data = await schema.validate(values, {
        abortEarly: false,
      });

      return {
        values: data as T,
        errors: {},
      };
    } catch (err: unknown) {
      const errors: FieldErrors<T> = {};

      if ((err as yup.ValidationError).inner) {
        (err as yup.ValidationError).inner.forEach((error) => {
          if (error.path) {
            // @ts-ignore
            errors[error.path] = {
              type: error.type ?? 'validation',
              message: error.message,
            };
          }
        });
      }

      return {
        values: {},
        errors,
      };
    }
  };
