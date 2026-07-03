import booksaLogo from '@/assets/images/booksa-logo.png';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

type BooksaLogoProps = {
  className?: string;
};

export default function BooksaLogo({ className = '' }: BooksaLogoProps) {
  return (
    <Link
      to={ROUTES.home}
      aria-label="Aller à l’accueil"
      className={`inline-flex h-8 w-[100px] items-center justify-center overflow-hidden text-[var(--color-text-primary)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${className}`.trim()}
    >
      <img src={booksaLogo} alt="Booksa" className="h-full w-full object-contain" />
    </Link>
  );
}
