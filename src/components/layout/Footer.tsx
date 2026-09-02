import { ChevronRightRegular } from '@fluentui/react-icons';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';

const footerBrowseTabs = ['Populaire', 'Arts et culture', 'Appartements adaptés à Booksa'];

const footerBrowseDestinations = [
  { location: 'Kinshasa', meta: 'Appartements et séjours' },
  { location: 'Johannesburg', meta: 'Échappées urbaines' },
  { location: 'Goma', meta: 'Séjours avec vue sur le lac' },
  { location: 'Kinshasa', meta: 'Escapades urbaines' },
  { location: 'Nairobi', meta: 'Appartements avec services' },
  { location: 'Le Cap', meta: 'Locations de villas' },
  { location: 'Mombasa', meta: 'Séjours en bord de mer' },
  { location: 'Kigali', meta: 'Locations mensuelles' },
  { location: 'Accra', meta: 'Locations de maisons' },
  { location: 'Lagos', meta: 'Locations d’appartements' },
  { location: 'Dar es Salaam', meta: 'Locations de vacances' },
  { location: 'Maputo', meta: 'Séjours côtiers' }
];

const footerLinks = [
  {
    title: 'Assistance',
    links: ['Centre d’aide', 'Informations de sécurité', 'Options d’annulation', 'Nous contacter', 'Accessibilité']
  },
  {
    title: 'Hébergement',
    links: ['Ajouter votre logement', 'Ressources pour hôtes', 'Hébergement responsable', 'Booksa pour les partenaires', 'Ouvrir un séjour']
  },
  {
    title: 'Booksa',
    links: ['À propos', 'Carrières', 'Salle de presse', 'Investisseurs', 'Conditions et confidentialité']
  }
];

function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-[1650px] px-4 py-10 sm:px-5 lg:px-8 lg:py-16">
        <section className="rounded-sm bg-[var(--color-surface-muted)] px-5 py-8 sm:px-8">
          <div className="max-w-7xl">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-[21.73248px]">
              Inspiration pour vos prochaines escapades
            </h2>

            <div className="mt-5 flex gap-6 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {footerBrowseTabs.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition ${
                    index === 0
                      ? 'border-[var(--color-text-primary)] text-[var(--color-text-primary)]'
                      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {footerBrowseDestinations.map((destination) => (
                <button key={destination.location} type="button" className="group text-left">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] transition group-hover:text-[var(--color-primary-500)]">
                    {destination.location}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{destination.meta}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--color-text-primary)] transition hover:text-[var(--color-primary-500)]"
              >
                Voir plus
                <ChevronRightRegular className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <div className="mt-14 grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="text-[12.84192px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-primary)]">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[12.84192px] text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary-500)]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--color-border)] pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-[var(--color-text-secondary)]">
            <span>© 2026 Booksa</span>
            <a href="#" className="transition hover:text-[var(--color-primary-500)]">
              Confidentialité
            </a>
            <a href="#" className="transition hover:text-[var(--color-primary-500)]">
              Conditions
            </a>
            <a href="#" className="transition hover:text-[var(--color-primary-500)]">
              Plan du site
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher compact />
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs text-[var(--color-text-primary)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
            >
              CDF
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
