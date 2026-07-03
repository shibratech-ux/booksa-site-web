import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel w-full max-w-lg rounded-[2rem] p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Page introuvable</h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          La route recherchée n’existe pas ou a été déplacée.
        </p>
        <div className="mt-8">
          <Button onClick={() => navigate(ROUTES.home)}>Retour à l’accueil</Button>
        </div>
      </div>
    </div>
  );
}
