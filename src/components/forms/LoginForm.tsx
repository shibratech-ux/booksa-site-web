import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  createLoginResolver,
  createLoginSchema,
  type LoginFormValues
} from '@/utils/validators';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';
import { getFirebaseAuthErrorKey, logFirebaseAuthError } from '@/utils/firebaseErrors';

// React Hook Form + Zod keeps the auth form strict and easy to extend.
export function LoginForm({ defaultEmail = '' }: { defaultEmail?: string }) {
  const { t } = useTranslation('auth');
  const { t: tErrors } = useTranslation('errors');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  const loginResolver = useMemo(() => createLoginResolver(loginSchema), [loginSchema]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: loginResolver,
    defaultValues: {
      email: defaultEmail,
      password: ''
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      toast.success(t('success'));
      const requestedPath = (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname;
      navigate(requestedPath ?? ROUTES.home, { replace: true });
    } catch (error) {
      logFirebaseAuthError('Email authentication failed:', error);
      toast.error(tErrors(getFirebaseAuthErrorKey(error)));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label={t('email')}
        type="email"
        autoComplete="email"
        placeholder={t('emailPlaceholder')}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label={t('password')}
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder={t('passwordPlaceholder')}
        error={errors.password?.message}
        helperText={t('credentialsHelper')}
        {...register('password')}
      />

      <button
        type="button"
        onClick={() => setShowPassword((value) => !value)}
        className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
      >
        {showPassword ? t('hidePassword') : t('showPassword')}
      </button>

      <Button type="submit" className="w-full" loading={isSubmitting}>
        {t('signIn')}
      </Button>
    </form>
  );
}
