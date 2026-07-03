import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'L’e-mail est requis').email('Entrez une adresse e-mail valide'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères')
});

export type LoginFormValues = z.infer<typeof loginSchema>;
