import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

type NotificationTab = 'offers' | 'account';

type NotificationItem = {
  label: string;
  status: string;
};

type NotificationGroup = {
  title: string;
  description?: string;
  items: NotificationItem[];
};

const offerGroups: NotificationGroup[] = [
  {
    title: 'Hosting insights and rewards',
    description: 'Learn about best hosting practices, and get access to exclusive hosting perks.',
    items: [
      { label: 'Recognition and achievements', status: 'Off' },
      { label: 'Insights and tips', status: 'Off' },
      { label: 'Pricing trends and suggestions', status: 'Off' },
      { label: 'Hosting perks', status: 'Off' }
    ]
  },
  {
    title: 'Hosting updates',
    description: 'Get updates about programs, features, and regulations.',
    items: [
      { label: 'News and updates', status: 'Off' },
      { label: 'Local laws and regulations', status: 'Off' }
    ]
  },
  {
    title: 'Travel tips and offers',
    description: 'Inspire your next trip with personalized recommendations and special offers.',
    items: [
      { label: 'Inspiration and offers', status: 'Off' },
      { label: 'Trip planning', status: 'Off' }
    ]
  },
  {
    title: 'Booksa updates',
    description: 'Stay up to date on the latest news from Booksa, and let us know how we can improve.',
    items: [
      { label: 'News and programs', status: 'Off' },
      { label: 'Feedback', status: 'Off' },
      { label: 'Travel regulations', status: 'Off' }
    ]
  }
];

const accountGroups: NotificationGroup[] = [
  {
    title: 'Account activity and policies',
    description: 'Confirm your booking and account activity, and learn about important Booksa policies.',
    items: [
      { label: 'Account activity', status: 'On: Email' },
      { label: 'Listing activity', status: 'On: Email and SMS' },
      { label: 'Guest policies', status: 'On: Email' },
      { label: 'Host policies', status: 'On: Email' }
    ]
  },
  {
    title: 'Reminders',
    description: 'Get important reminders about your reservations, listings, and account activity.',
    items: [{ label: 'Reminders', status: 'On: Email' }]
  },
  {
    title: 'Guest and Host messages',
    description: 'Keep in touch with hosts and guests before, during, and after your reservation.',
    items: [{ label: 'Messages', status: 'On: Email' }]
  }
];

function NotificationGroupSection({ group, isFirst }: { group: NotificationGroup; isFirst: boolean }) {
  return (
    <section className={`${isFirst ? 'pt-7' : 'mt-7 border-t border-[var(--color-border)] pt-7'}`}>
      <h3 className="text-2xl font-semibold tracking-[-0.03em]">{group.title}</h3>
      {group.description ? (
        <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">{group.description}</p>
      ) : null}

      <div className="mt-5 space-y-6">
        {group.items.map((item) => (
          <div key={item.label}>
            <h4>{item.label}</h4>
            <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{item.status}</p>
            <button type="button" className="mt-1 font-semibold underline underline-offset-2">
              Edit
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function NotificationsContent() {
  const [activeTab, setActiveTab] = useState<NotificationTab>('offers');
  const [unsubscribeMarketing, setUnsubscribeMarketing] = useState(false);
  const groups = activeTab === 'offers' ? offerGroups : accountGroups;

  return (
    <div className="mx-auto max-w-[760px]">
      <h2 className="text-[23.52px] font-semibold tracking-[-0.035em] sm:text-[25.2px]">Notifications</h2>

      <div className="mt-6 flex border-b border-[var(--color-border)]" role="tablist" aria-label="Notification categories">
        {([
          ['offers', 'Offers and updates'],
          ['account', 'Account']
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`relative px-4 pb-3 text-sm font-medium transition first:pl-0 ${
              activeTab === id ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {label}
            {activeTab === id ? (
              <motion.span
                layoutId="notifications-tab-indicator"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--color-text-primary)]"
              />
            ) : null}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {groups.map((group, index) => (
          <NotificationGroupSection key={group.title} group={group} isFirst={index === 0} />
        ))}

        {activeTab === 'offers' ? (
          <div className="mt-7 border-t border-[var(--color-border)] py-8">
            <label className="flex cursor-pointer items-center gap-4">
              <input
                type="checkbox"
                checked={unsubscribeMarketing}
                onChange={(event) => setUnsubscribeMarketing(event.target.checked)}
                className="peer sr-only"
              />
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-[var(--radius-xs)] border transition ${
                unsubscribeMarketing
                  ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                  : 'border-[var(--color-text-secondary)]'
              }`}>
                {unsubscribeMarketing ? <FiCheck className="h-4 w-4" aria-hidden="true" /> : null}
              </span>
              <span>Unsubscribe from all marketing emails</span>
            </label>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
