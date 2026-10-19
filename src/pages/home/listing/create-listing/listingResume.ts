import { ROUTES } from '@/utils/constants';
import { wizardSteps } from '@/domain/listing';

// Retain the stored step IDs for compatibility with existing documents and Flutter.
export function resolveRemovedListingPage(page?: string) {
  if (page === 'map-visibility') return 'location';
  return page === 'bathroom-types' || page === 'who-else' ? 'basics' : page;
}

/** Flutter persists one resume path; React renders the same steps in three sections. */
export function getListingResumeTarget(resumePage?: string) {
  resumePage = resolveRemovedListingPage(resumePage);
  if (!resumePage || resumePage === 'address') return { path: ROUTES.hostListingCreate, page: undefined };
  const step = wizardSteps.indexOf(resumePage as typeof wizardSteps[number]);
  if (step < 0) return { path: ROUTES.hostListingFirstSection, page: 'introduction' };
  return {
    path: step < wizardSteps.indexOf('make-it-stand-out-introduction')
      ? ROUTES.hostListingFirstSection
      : step < wizardSteps.indexOf('finish-and-publish-introduction')
        ? ROUTES.hostListingSecondSection : ROUTES.hostListingThirdSection,
    page: ['setup', 'make-it-stand-out-introduction', 'finish-and-publish-introduction'].includes(resumePage)
      ? 'introduction' : resumePage
  };
}
