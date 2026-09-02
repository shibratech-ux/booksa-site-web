import booksaLogo from '@/assets/images/booksa-logo.png';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { useTranslation } from 'react-i18next';
import { ShimmerImage } from '@/components/ui/ShimmerImage';

type BooksaLogoProps = {
  className?: string;
};

export default function BooksaLogo({ className = '' }: BooksaLogoProps) {
  const { t } = useTranslation('common');

  return (
    <Link
      to={ROUTES.home}
      aria-label={t('accessibility.goHome')}
      className={`inline-flex h-8 w-[110px] items-center justify-center overflow-hidden text-[var(--color-text-primary)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${className}`.trim()}
    >
      <ShimmerImage src={booksaLogo} alt="Booksa" className="h-full w-full object-contain" />
    </Link>
  );
}
