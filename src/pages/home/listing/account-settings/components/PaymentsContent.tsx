import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiChevronDown, FiChevronRight, FiCreditCard } from 'react-icons/fi';
import { updateLoggedInUserProfile } from '@/services/user.service';
import { ShimmerImage } from '@/components/ui/ShimmerImage';

type PaymentsTab = 'payments' | 'payouts' | 'service-fee' | 'donations';
type ServiceFee = 'single' | 'split';

const tabs: Array<{ id: PaymentsTab; label: string }> = [
  { id: 'payments', label: 'Payments' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'service-fee', label: 'Service fee' },
  { id: 'donations', label: 'Donations' }
];

const faqs = [
  ['Why donate to Booksa.org?', 'Your donation helps provide temporary housing to people affected by emergencies and disasters.'],
  ['How does a host payout donation work?', 'A selected percentage is automatically donated from eligible host payouts.'],
  ['How can I manage my host payout donation?', 'Return to this page at any time to change or stop your donation.'],
  ['Can I donate from split payouts?', 'Donation availability can depend on the payout method and region.'],
  ['Are there other ways to donate?', 'You can also make a one-time donation directly through Booksa.org.'],
  ['Where are donations tax deductible?', 'Tax deductibility varies by country and local tax rules.']
] as const;

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="mt-6 min-h-12 rounded-md bg-[var(--color-text-primary)] px-6 font-semibold text-[var(--color-surface)] transition hover:opacity-85"
    >
      {children}
    </button>
  );
}

function PaymentsTabContent() {
  return (
    <div>
      <section className="pt-8">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]">Your payments</h3>
        <p className="mt-1">Keep track of all your payments and refunds.</p>
        <PrimaryButton>Manage payments</PrimaryButton>
      </section>

      <section className="pt-16">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]">Payment methods</h3>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          Add a payment method using our secure payment system, then start planning your next trip.
        </p>
        <div className="mt-8 border-t border-[var(--color-border)]">
          <PrimaryButton>Add payment method</PrimaryButton>
        </div>
      </section>

      <section className="pt-16">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]">Booksa gift credit</h3>
        <PrimaryButton>Add gift card</PrimaryButton>
      </section>

      <section className="py-16">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]">Coupons</h3>
        <div className="mt-5 flex justify-between border-t border-[var(--color-border)] pt-5">
          <span>Your coupons</span>
          <span>0</span>
        </div>
        <PrimaryButton>Add coupon</PrimaryButton>

        <article className="mt-7 rounded-sm border border-[var(--color-border)] p-6">
          <FiCreditCard className="h-10 w-10 text-pink-500" aria-hidden="true" />
          <h4 className="mt-5 font-semibold">Make all payments through Booksa</h4>
          <p className="mt-2 text-sm leading-5 text-[var(--color-text-secondary)]">
            Always pay and communicate through Booksa to ensure you’re protected under our Terms of Service, Payments Terms of Service, cancellation, and other safeguards.
          </p>
        </article>
      </section>
    </div>
  );
}

function PayoutsTabContent() {
  return (
    <div>
      <section className="pt-8">
        <h3 className="text-[27.65952px] font-semibold tracking-[-0.035em]">How you’ll get paid</h3>
        <p className="mt-1 text-lg">Add at least one payout method so we know where to send your money.</p>
        <PrimaryButton>Set up payouts</PrimaryButton>
      </section>

      <section className="mt-14 rounded-sm border border-[var(--color-border)] p-6">
        <h3 className="text-lg font-semibold">Need help?</h3>
        {['When you’ll get your payout', 'How payouts work', 'Go to your transaction history'].map((item) => (
          <button key={item} type="button" className="mt-5 flex w-full items-center justify-between gap-5 text-left font-semibold underline underline-offset-2">
            {item}
            <FiChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </button>
        ))}
      </section>
    </div>
  );
}

function ServiceFeeTabContent({ initialFee, onSaved }: { initialFee: ServiceFee; onSaved?: (fee: ServiceFee) => void }) {
  const [savedFee, setSavedFee] = useState<ServiceFee>(initialFee);
  const [selectedFee, setSelectedFee] = useState<ServiceFee>(initialFee);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveFee = async () => {
    if (selectedFee === savedFee || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateLoggedInUserProfile({ 'paymentSettings.serviceFee': selectedFee });
      setSavedFee(selectedFee);
      onSaved?.(selectedFee);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save the service fee setting.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pt-8">
      <h3 className="text-2xl font-semibold tracking-[-0.03em]">Service fee settings</h3>
      <p className="mt-1">Choose a service fee pricing option for all of your listings.</p>

      <div className="mt-8 space-y-10">
        <label className="flex cursor-pointer items-start gap-4">
          <input type="radio" name="service-fee" value="single" checked={selectedFee === 'single'} onChange={() => setSelectedFee('single')} className="mt-1 h-6 w-6 accent-[var(--color-text-primary)]" />
          <span>
            <span className="font-semibold">Single fee <span className="ml-1 rounded-sm bg-[var(--color-surface-muted)] px-2 py-1 text-[10.86624px]">RECOMMENDED</span></span>
            <span className="mt-1 block text-sm leading-5 text-[var(--color-text-secondary)]">Booksa deducts 15.5% from your earnings, and guests will not pay a service fee.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-4">
          <input type="radio" name="service-fee" value="split" checked={selectedFee === 'split'} onChange={() => setSelectedFee('split')} className="mt-1 h-6 w-6 accent-[var(--color-text-primary)]" />
          <span>
            <span className="font-semibold">Split fee {savedFee === 'split' ? ' (CURRENT SETTING)' : ''}</span>
            <span className="mt-1 block text-sm leading-5 text-[var(--color-text-secondary)]">Booksa deducts 3% from your earnings, and guests pay a service fee on top of host charges.</span>
          </span>
        </label>
      </div>

      <p className="mt-10 text-sm text-[var(--color-text-secondary)]">For listings located in Brazil and Mexico, Booksa deducts a 16% host fee for single fee and 4% host fee for split fee.</p>

      <article className="mt-7 rounded-sm border border-[var(--color-border)] p-6">
        <FiCreditCard className="h-10 w-10 text-pink-500" aria-hidden="true" />
        <h4 className="mt-5 font-semibold">Same payout, simpler pricing</h4>
        <p className="mt-3 text-sm leading-5 text-[var(--color-text-secondary)]">You can make the same amount of money and your guests won’t pay more. Choose single fee and adjust your prices accordingly.</p>
      </article>

      {saveError ? <p role="alert" className="mt-4 text-sm text-[var(--color-danger)]">{saveError}</p> : null}
      <div className="mt-8 flex gap-4 border-t border-[var(--color-border)] pt-6">
        <button type="button" onClick={() => void saveFee()} disabled={selectedFee === savedFee || isSaving} className="min-h-12 rounded-md bg-[var(--color-text-primary)] px-9 font-semibold text-[var(--color-surface)] disabled:cursor-default disabled:opacity-30">{isSaving ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={() => setSelectedFee(savedFee)} className="min-h-12 rounded-md bg-[var(--color-surface-muted)] px-9 font-semibold">Cancel</button>
      </div>
    </div>
  );
}

function DonationsTabContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="pt-8">
      <article className="flex gap-4 rounded-sm border border-[var(--color-border)] p-5">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-blue-500 text-white"><FiBell aria-hidden="true" /></span>
        <div><h3 className="font-semibold">Host payout donations aren’t available</h3><p className="mt-1 text-sm text-[var(--color-text-secondary)]">These aren’t available to hosts in your location. You can show your support by making a one-time or monthly donation.</p></div>
      </article>

      <section className="pt-10">
        <h3 className="text-[29.6352px] font-semibold tracking-[-0.04em]">Donate to Booksa.org</h3>
        <p className="mt-2 text-[var(--color-text-secondary)]">Give a percentage of each payout to Booksa.org, a nonprofit that gives free emergency housing to people affected by disasters.</p>
        <h4 className="mt-8 font-semibold">Choose a percentage to donate</h4>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">For example, a 3% donation of a $500 payout would be $15.</p>
        <div className="mt-5 flex flex-wrap gap-3">{['1%', '3%', '5%', 'Other'].map((amount) => <button key={amount} type="button" disabled className="rounded-md border border-[var(--color-border)] px-7 py-3 text-[var(--color-text-secondary)] opacity-60">{amount}</button>)}</div>
      </section>

      <section className="mt-10 border-t border-[var(--color-border)] pt-10">
        <h3 className="text-2xl font-semibold">Frequently asked questions</h3>
        <div className="mt-5">
          {faqs.map(([question, answer], index) => (
            <div key={question} className="border-b border-[var(--color-border)]">
              <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index} className="flex w-full items-center justify-between gap-5 py-6 text-left text-lg">
                {question}<FiChevronDown className={`h-5 w-5 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <motion.div initial={false} animate={{ height: openFaq === index ? 'auto' : 0, opacity: openFaq === index ? 1 : 0 }} className="overflow-hidden"><p className="pb-6 text-sm text-[var(--color-text-secondary)]">{answer}</p></motion.div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10">
        <h3 className="text-2xl font-semibold">Your donations at work</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {[
            ['Central Texas floods', 'Central Texas, US', 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=700&q=80'],
            ['Community fire recovery', 'Southeast Asia', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=80']
          ].map(([title, location, image]) => (
            <article key={title} className="overflow-hidden rounded-sm border border-[var(--color-border)] shadow-sm"><ShimmerImage src={image} alt="" className="h-48 w-full object-cover" /><div className="p-4"><h4 className="font-semibold">{title}</h4><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{location}</p></div></article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PaymentsContent({ initialServiceFee, onServiceFeeSaved }: { initialServiceFee?: string; onServiceFeeSaved?: (fee: ServiceFee) => void }) {
  const [activeTab, setActiveTab] = useState<PaymentsTab>('payments');
  const serviceFee: ServiceFee = initialServiceFee === 'single' ? 'single' : 'split';

  return (
    <div className="mx-auto max-w-[836px]">
      <h2 className="text-[27.65952px] font-semibold tracking-[-0.035em] sm:text-[29.6352px]">Payments</h2>
      <div className="mt-6 flex overflow-x-auto border-b border-[var(--color-border)]" role="tablist" aria-label="Payment settings">
        {tabs.map(({ id, label }) => (
          <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} className={`relative min-w-max px-4 pb-3 text-sm font-medium first:pl-0 ${activeTab === id ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
            {label}{activeTab === id ? <motion.span layoutId="payments-tab-indicator" className="absolute inset-x-0 -bottom-px h-0.5 rounded-sm bg-[var(--color-text-primary)]" /> : null}
          </button>
        ))}
      </div>
      <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'payments' ? <PaymentsTabContent /> : activeTab === 'payouts' ? <PayoutsTabContent /> : activeTab === 'service-fee' ? <ServiceFeeTabContent initialFee={serviceFee} onSaved={onServiceFeeSaved} /> : <DonationsTabContent />}
      </motion.div>
    </div>
  );
}
