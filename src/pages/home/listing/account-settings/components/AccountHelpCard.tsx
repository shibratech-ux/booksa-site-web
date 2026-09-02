import { FiEye, FiLock, FiShield } from 'react-icons/fi';

const helpItems = [
  {
    icon: FiShield,
    title: "Why isn’t my info shown here?",
    description: 'We’re hiding some account details to protect your identity.'
  },
  {
    icon: FiLock,
    title: 'Which details can be edited?',
    description:
      'Contact info and personal details can be edited. If this info was used to verify your identity, you’ll need to get verified again the next time you book—or to continue hosting.'
  },
  {
    icon: FiEye,
    title: 'What info is shared with others?',
    description:
      'Booksa only releases contact information for Hosts and guests after a reservation is confirmed.'
  }
];

export function AccountHelpCard() {
  return (
    <section aria-label="Personal information help" className="mt-12 rounded-sm border border-[var(--color-border)] px-6 sm:px-7">
      {helpItems.map(({ icon: Icon, title, description }, index) => (
        <article
          key={title}
          className={`flex gap-5 py-6 ${index < helpItems.length - 1 ? 'border-b border-[var(--color-border)]' : ''}`}
        >
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-pink-500 text-pink-500">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-semibold tracking-[-0.02em]">{title}</h3>
            <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">{description}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
