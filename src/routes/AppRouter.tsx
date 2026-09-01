import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { ROUTES } from '@/utils/constants';

const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'));
const ExperiencesPage = lazy(() => import('@/pages/home/experiences/ExperiencesPage'));
const ExperienceDetailPage = lazy(() => import('@/pages/home/experiences/ExperienceDetailPage'));
const ServicesPage = lazy(() => import('@/pages/home/services/ServicesPage'));
const ServiceDetailPage = lazy(() => import('@/pages/home/services/ServiceDetailPage'));
const SeeAllPage = lazy(() => import('@/pages/home/listing/SeeAllPage'));
const PhotoTourPage = lazy(() => import('@/pages/home/listing/PhotoTourPage'));
const ListingDetailPage = lazy(() => import('@/pages/home/listing/ListingDetailPage'));
const HostListingsPage = lazy(() => import('@/pages/home/listing/HostListingsPage'));
const HostProfilePage = lazy(() => import('@/pages/home/listing/HostProfilePage'));
const MessagesPage = lazy(() => import('@/pages/messages/MessagesPage'));
const TripsPage = lazy(() => import('@/pages/trips/TripsPage'));
const ListingSetupPage = lazy(() => import('@/pages/home/listing/create-listing/ListingSetupPage'));
const CreateListingPage = lazy(
  () => import('@/pages/home/listing/create-listing/CreateListingPage')
);
const ListingSectionPage = lazy(
  () => import('@/pages/home/listing/create-listing/ListingSectionPage')
);
const AccountSettingsPage = lazy(
  () => import('@/pages/home/listing/account-settings/AccountSettingsPage')
);
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
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
          <Route path={ROUTES.homes} element={<MainLayout />} />
          <Route path={ROUTES.experiences} element={<ExperiencesPage />} />
          <Route path={ROUTES.experienceDetail} element={<ExperienceDetailPage />} />
          <Route path={ROUTES.services} element={<ServicesPage />} />
          <Route path={ROUTES.serviceDetail} element={<ServiceDetailPage />} />
          <Route path={ROUTES.seeAll} element={<SeeAllPage />} />
          <Route path={ROUTES.photoTour} element={<PhotoTourPage />} />
          <Route path={ROUTES.confirmPay} element={<ConfirmPayPage />} />
          <Route path={ROUTES.listingDetail} element={<ListingDetailPage />} />
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.trips} element={<TripsPage />} />
            <Route path={ROUTES.messages} element={<MessagesPage />} />
            <Route path={ROUTES.hostListings} element={<HostListingsPage />} />
            <Route path={ROUTES.hostListingSetup} element={<ListingSetupPage />} />
            <Route path={ROUTES.hostListingCreate} element={<CreateListingPage />} />
            <Route path={ROUTES.hostListingSections} element={<ListingSectionPage />} />
            <Route
              path={ROUTES.hostListingCreateFromExisting}
              element={<CreateListingPage />}
            />
            <Route path={ROUTES.hostProfile} element={<HostProfilePage />} />
            <Route path={ROUTES.hostAccountSettings} element={<AccountSettingsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
