import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import finishAndPublishImage from '@/assets/images/listing-step-finish.png';

export function FinishAndPublishIntroduction() {
  const { t } = useTranslation('booking');
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      aria-labelledby="finish-publish-title"
      className="flex min-h-0 flex-1 overflow-y-auto overscroll-contain"
    >
      <div className="mx-auto grid w-full max-w-[1280px] content-start items-center gap-6 px-6 pb-10 pt-4 sm:gap-8 sm:px-10 sm:py-8 lg:my-auto lg:grid-cols-2 lg:gap-16 lg:px-12">
        <div className="max-w-xl">
          <p className="text-sm font-semibold sm:text-base">
            {t('finishPublishIntro.stepLabel', { current: 3 })}
          </p>
          <h1 id="finish-publish-title" className="mt-2 text-[28px] font-semibold leading-[1.15] tracking-[-0.04em] sm:text-[40px] lg:mt-4 lg:text-[56px]">
            {t('finishPublishIntro.title')}
          </h1>
          <p className="mt-3 max-w-lg text-base leading-6 sm:text-lg sm:leading-8 lg:mt-5 lg:text-[var(--color-text-secondary)]">
            {t('finishPublishIntro.description')}
          </p>
        </div>

        <div className="order-first flex min-w-0 items-center justify-center overflow-hidden rounded-dialog lg:order-none">
          <ShimmerImage
            src={finishAndPublishImage}
            alt=""
            fetchPriority="high"
            width={1254}
            height={1254}
            className="aspect-square max-h-[42dvh] w-full max-w-[375px] object-contain sm:max-h-[44dvh] sm:max-w-[440px] lg:max-h-[65dvh] lg:max-w-[560px]"
          />
        </div>
      </div>
    </motion.section>
  );
}
