// Single source of truth for company details and services.
// Service titles MUST match the list in server/src/validate.js.

export const COMPANY = {
  name: 'EKADANTA TRADERS',
  email: 'ekadantatraders.0208@gmail.com',
  phones: [
    { display: '+91 8054547411', tel: '+918054547411' },
    { display: '+91 9888633538', tel: '+919888633538' },
    { display: '+91 9115904093', tel: '+919115904093' },
  ],
  instagram: {
    handle: '@ekadanta_traders.ig',
    url: 'https://www.instagram.com/ekadanta_traders.ig/',
  },
  // WhatsApp uses the first listed phone number. Change `number` here (digits only, with country code)
  // if a different number should receive WhatsApp messages.
  whatsapp: {
    number: '918054547411',
    display: '+91 8054547411',
    message: 'Hello EKADANTA TRADERS, I would like to make an enquiry.',
  },
};

export const WHATSAPP_URL = `https://wa.me/${COMPANY.whatsapp.number}?text=${encodeURIComponent(COMPANY.whatsapp.message)}`;

export const SERVICES = [
  {
    id: 'property',
    title: 'Property Sale & Purchase',
    icon: 'Building2',
    description:
      'Buying or selling a plot, house or commercial property? Tell us what you are looking for and we will get back to you.',
  },
  {
    id: 'trade',
    title: 'Import & Export',
    icon: 'Ship',
    description:
      'Goods moving into or out of India. Share the product, quantity and the market you are sourcing from or selling to.',
  },
  {
    id: 'construction',
    title: 'Construction',
    icon: 'HardHat',
    description:
      'Residential and commercial building work. Describe your project, its location and the time you have in mind.',
  },
  {
    id: 'utility',
    title: 'Utility Services',
    icon: 'Zap',
    description:
      'Utility work for homes, buildings and sites. Tell us what needs to be installed, repaired or maintained.',
  },
  {
    id: 'contractor',
    title: 'Contractor Services',
    icon: 'Wrench',
    description:
      'Contract work for civil, site and project needs. Send us the scope and we will respond with the next steps.',
  },
  {
    id: 'cars',
    title: 'Car Sale & Purchase',
    icon: 'Car',
    description:
      'Looking to buy or sell a car? Share the make, model and your budget or asking price.',
  },
];

export const SERVICE_OPTIONS = [...SERVICES.map((s) => s.title), 'Other'];
