import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { MainLayout } from '@/layouts/MainLayout';
import { ROUTES } from '@/utils/constants';

const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'));
const ExperiencesPage = lazy(() => import('@/pages/home/experiences/ExperiencesPage'));
const ServicesPage = lazy(() => import('@/pages/home/services/ServicesPage'));
const ServiceDetailPage = lazy(() => import('@/pages/home/services/ServiceDetailPage'));
const SeeAllPage = lazy(() => import('@/pages/home/seeall/SeeAllPage'));
const PhotoTourPage = lazy(() => import('@/pages/home/phototour/phototour'));
const ListingDetailPage = lazy(() => import('@/pages/home/ListingDetailPage'));
const ConfirmPayPage = lazy(() => import('@/pages/pay/confirmpay'));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const previousBehavior = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousBehavior;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function AppRouter() {
  const location = useLocation();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<MainLayout />} />
          <Route path={ROUTES.experiences} element={<ExperiencesPage />} />
          <Route path={ROUTES.services} element={<ServicesPage />} />
          <Route path={ROUTES.serviceDetail} element={<ServiceDetailPage />} />
          <Route path={ROUTES.seeAll} element={<SeeAllPage />} />
          <Route path={ROUTES.photoTour} element={<PhotoTourPage />} />
          <Route path={ROUTES.confirmPay} element={<ConfirmPayPage />} />
          <Route path={ROUTES.listingDetail} element={<ListingDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
