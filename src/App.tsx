import { AppRouter } from '@/routes/AppRouter';
import { LanguageSynchronizer } from '@/components/language/LanguageSynchronizer';

export default function App() {
  return (
    <>
      <LanguageSynchronizer />
      <AppRouter />
    </>
  );
}
