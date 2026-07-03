import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginSchema, type LoginFormValues } from '@/utils/validators';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

// React Hook Form + Zod keeps the auth form strict and easy to extend.
export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'jordan.wells@booksa.io',
      password: 'password123'
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      toast.success('Authentification réussie');
      navigate(ROUTES.home);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de se connecter';
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="nom@entreprise.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Mot de passe"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="Entrez votre mot de passe"
        error={errors.password?.message}
        helperText="Utilisez vos identifiants professionnels."
        {...register('password')}
      />

      <button
        type="button"
        onClick={() => setShowPassword((value) => !value)}
        className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
      >
        {showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      </button>

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Se connecter en toute sécurité
      </Button>
    </form>
  );
}
