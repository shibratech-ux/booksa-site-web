type SeeAllCardProps = {
  title: string;
  images: string[];
  onClick: () => void;
};

export function SeeAllCard({ title, images, onClick }: SeeAllCardProps) {
  const previews = images.filter(Boolean).slice(0, 3);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Tout voir : ${title}`}
      className="marketplace-reference-card group flex aspect-[1.04/1] shrink-0 snap-start self-start flex-col items-center justify-center gap-3 rounded-photo bg-white text-slate-900 shadow-[0_5px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.025] transition duration-200 hover:shadow-[0_7px_22px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-inset sm:gap-4"
    >
      <span aria-hidden="true" className="relative block h-[54%] w-[66%] max-w-32">
        {previews.map((src, index) => (
          <img
            key={`${src}-${index}`}
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            className={`absolute h-[76%] w-[60%] rounded-photo border-[3px] border-white object-cover shadow-[0_2px_5px_rgba(0,0,0,0.22)] transition-transform duration-200 motion-reduce:transition-none ${
              index === 0
                ? 'left-[19%] top-0 -rotate-[9deg] group-hover:-rotate-12'
                : index === 1
                  ? 'right-0 top-[12%] rotate-[8deg] group-hover:rotate-12'
                  : 'bottom-0 left-0 -rotate-[6deg] group-hover:-rotate-[9deg]'
            }`}
          />
        ))}
      </span>
      <span className="text-[12px] font-semibold leading-[15px] sm:text-[13px] sm:leading-[17px]">Tout voir</span>
    </button>
  );
}
