import HomePage from '@/pages/home';
import type { ExploreCategoryId } from '@/services/listing-catalog.service';

// Shared shell for the home page; `category` limits it to one Explore tag.
export function MainLayout({ category }: { category?: ExploreCategoryId }) {
  return (
    <div className="project-shell min-h-screen text-[var(--color-text-primary)]">
      <HomePage category={category} />
    </div>
  );
}
