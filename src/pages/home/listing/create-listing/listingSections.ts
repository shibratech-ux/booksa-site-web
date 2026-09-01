import aboutYourPlaceImage from '@/assets/images/listing-step-place.png';
import makeItStandOutImage from '@/assets/images/listing-step-stand-out.png';
import finishAndPublishImage from '@/assets/images/listing-step-finish.png';

export type ListingSection = {
  id: string;
  step: number;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
};

export const listingSections: ListingSection[] = [
  {
    id: 'about-your-place',
    step: 1,
    title: 'Tell us about your place',
    description:
      'In this step, we’ll ask you which type of property you have and if guests will book the entire place or just a room. Then let us know the location and how many guests can stay.',
    image: aboutYourPlaceImage,
    imageAlt: 'Isometric cutaway illustration of a furnished two-story home'
  },
  {
    id: 'make-it-stand-out',
    step: 2,
    title: 'Make your place stand out',
    description:
      'In this step, you’ll add some of the amenities your place offers, plus 5 or more photos. Then, you’ll create a title and description.',
    image: makeItStandOutImage,
    imageAlt: 'Isometric cutaway illustration of a polished and thoughtfully decorated two-story home'
  },
  {
    id: 'finish-and-publish',
    step: 3,
    title: 'Finish up and publish',
    description:
      'Finally, you’ll choose booking settings, set up pricing, review the details, and publish your listing.',
    image: finishAndPublishImage,
    imageAlt: 'Isometric illustration of a modern two-story guest house with solar panels'
  }
];

export const firstListingSection = listingSections[0];

export const getListingSection = (sectionId?: string) =>
  listingSections.find(({ id }) => id === sectionId) ?? firstListingSection;
