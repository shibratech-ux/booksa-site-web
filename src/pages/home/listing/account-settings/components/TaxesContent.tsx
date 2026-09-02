import { useState } from 'react';
import { motion } from 'framer-motion';

type TaxesTab = 'taxpayers' | 'tax-documents';

const taxDocumentYears = [2025, 2024, 2023, 2022];

function TextLink({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="font-semibold underline underline-offset-2">
      {children}
    </button>
  );
}

export function TaxesContent() {
  const [activeTab, setActiveTab] = useState<TaxesTab>('taxpayers');

  return (
    <div className="mx-auto max-w-[836px]">
      <h2 className="text-[27.65952px] font-semibold tracking-[-0.035em] sm:text-[29.6352px]">Taxes</h2>

      <div className="mt-7 flex border-b border-[var(--color-border)]" role="tablist" aria-label="Tax settings">
        {([
          ['taxpayers', 'Taxpayers'],
          ['tax-documents', 'Tax documents']
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
                layoutId="taxes-tab-indicator"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-sm bg-[var(--color-text-primary)]"
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
        {activeTab === 'taxpayers' ? (
          <div>
            <section className="pt-10">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">Taxpayer information</h3>
              <p className="mt-2">
                Tax info is required for most countries/regions. <TextLink>Learn more</TextLink>
              </p>
              <button
                type="button"
                className="mt-8 min-h-12 rounded-md bg-[var(--color-text-primary)] px-6 font-semibold text-[var(--color-surface)] transition hover:opacity-85"
              >
                Add tax info
              </button>
            </section>

            <section className="pt-16">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">Value Added Tax (VAT)</h3>
              <p className="mt-2">
                If you are VAT-registered, please add your VAT ID. <TextLink>Learn more</TextLink>
              </p>
              <button
                type="button"
                className="mt-8 min-h-12 rounded-md bg-[var(--color-text-primary)] px-6 font-semibold text-[var(--color-surface)] transition hover:opacity-85"
              >
                Add VAT ID number
              </button>
            </section>

            <section className="py-16">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">Need help?</h3>
              <p className="mt-2">
                Get answers to questions about taxes in our <TextLink>Help Center</TextLink>.
              </p>
            </section>
          </div>
        ) : (
          <div>
            <section className="border-b border-[var(--color-border)] py-10">
              <p>Tax documents required for filing taxes are available to review and download here.</p>
              <p className="mt-7">
                You can also file taxes using detailed earnings info, available in the{' '}
                <TextLink>earnings summary</TextLink>.
              </p>
            </section>

            <div>
              {taxDocumentYears.map((year) => (
                <section key={year} className="border-b border-[var(--color-border)] py-10 sm:py-12">
                  <h3 className="text-2xl font-semibold tracking-[-0.03em]">{year}</h3>
                  <p className="mt-1 text-[var(--color-text-secondary)]">No tax document issued</p>
                </section>
              ))}
            </div>

            <p className="py-10">
              For tax documents issued prior to 2022, <TextLink>contact us</TextLink>.
            </p>

            <section className="pb-16 pt-6">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">Need help?</h3>
              <p className="mt-2">
                Get answers to questions about taxes in our <TextLink>Help Center</TextLink>.
              </p>
            </section>
          </div>
        )}
      </motion.div>
    </div>
  );
}
