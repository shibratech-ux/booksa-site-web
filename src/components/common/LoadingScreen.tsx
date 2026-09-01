import BooksaLogo from '@/components/layout/BooksaLogo';
import { motion } from 'framer-motion';
import { useTheme } from '@/theme/useTheme';
import { useTranslation } from 'react-i18next';

interface LoadingScreenProps {
  fullScreen?: boolean;
  label?: string;
  className?: string;
}

export function LoadingScreen({
  fullScreen = true,
  label,
  className
}: LoadingScreenProps) {
  const { theme } = useTheme();
  const { t } = useTranslation('common');
  const statusLabel = label ?? t('states.loadingInterface');

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${fullScreen ? 'min-h-screen w-full' : 'min-h-[240px] w-full'} ${className ?? ''}`.trim()}
      style={{
        backgroundColor: theme.colors.background,
        backgroundImage: `radial-gradient(circle at top, ${theme.colors.primary[50]} 0%, ${theme.colors.background} 55%)`
      }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          backgroundImage: `radial-gradient(circle at center, ${theme.colors.primary[100]} 0%, transparent 55%)`,
          opacity: 0.45
        }}
      />

      <motion.div
        className="relative flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute inset-[-18px] rounded-full"
            animate={{ opacity: [0.25, 0.6, 0.25], scale: [0.95, 1.05, 0.95] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
            style={{
              background: `radial-gradient(circle, ${theme.colors.primary[100]} 0%, transparent 70%)`
            }}
          />

          <div
            className="relative rounded-2xl px-5 py-4"
            style={{
              backgroundColor: 'transparent'
            }}
          >
            <BooksaLogo className="h-8 w-[110px]" />
          </div>
          <p className="sr-only" role="status" aria-live="polite">{statusLabel}</p>
        </motion.div>

        {/* <p className="mt-5 text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
          {label}
        </p>
        <p className="mt-1 text-xs" style={{ color: theme.colors.textSecondary }}>
          Préparation de l’espace sécurisé
        </p> */}
      </motion.div>
    </div>
  );
}
