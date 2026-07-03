import { ChevronRightRegular, GlobeRegular } from '@fluentui/react-icons';

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
    <footer className="border-t border-slate-200 bg-white/90">
      <div className="mx-auto max-w-[1500px] px-4 py-12 lg:px-6">
        <section className="rounded-[32px]  px-5 py-8 sm:px-8">
          <div className="max-w-7xl">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-xl">
              Inspiration pour vos prochaines escapades
            </h2>

            <div className="mt-5 flex gap-6 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {footerBrowseTabs.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition ${
                    index === 0
                      ? 'border-slate-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {footerBrowseDestinations.map((destination) => (
                <button key={destination.location} type="button" className="group text-left">
                  <p className="text-sm font-semibold text-gray-900 transition group-hover:text-[var(--color-primary-500)]">
                    {destination.location}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{destination.meta}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 transition hover:text-[var(--color-primary-500)]"
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
              <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-gray-900">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[12px] text-gray-600 transition hover:text-[var(--color-primary-500)]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-gray-600">
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
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <GlobeRegular className="h-4 w-4" />
              Français
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
