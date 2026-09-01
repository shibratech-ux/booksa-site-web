import { z } from 'zod';
import type { TFunction } from 'i18next';
import type { FieldError, Resolver } from 'react-hook-form';

export function createLoginSchema(t: TFunction<'auth'>) {
  return z.object({
    email: z.string().min(1, t('validation.emailRequired')).email(t('validation.invalidEmail')),
    password: z.string().min(6, t('validation.passwordMinLength', { count: 6 }))
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export function createLoginResolver(
  schema: ReturnType<typeof createLoginSchema>
): Resolver<LoginFormValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: Partial<Record<keyof LoginFormValues, FieldError>> = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0];

      if ((field === 'email' || field === 'password') && !errors[field]) {
        errors[field] = {
          type: issue.code,
          message: issue.message
        };
      }
    }

    return { values: {}, errors };
  };
}
