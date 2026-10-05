import {
  ArrowLeft,
  Building2,
  Car,
  HardHat,
  Ship,
  Wrench,
  Zap,
} from 'lucide-react';

const ICONS = {
  Building2,
  Ship,
  HardHat,
  Zap,
  Wrench,
  Car,
};

const SERVICE_DETAILS = {
  'Property Sale & Purchase': {
    eyebrow: 'PROPERTY SERVICES',
    description:
      'Professional assistance for property sale and purchase, helping clients identify suitable opportunities and move through the process with clarity and confidence.',
    points: [
      'Residential and commercial property opportunities',
      'Property buying and selling assistance',
      'Opportunity identification and coordination',
      'Client-focused support throughout the process',
    ],
  },

  'Import & Export': {
    eyebrow: 'IMPORT & EXPORT',
    description:
      'Reliable support for import and export requirements, with a focus on sourcing, coordination and smooth movement of goods across markets.',
    points: [
      'Import and export coordination',
      'Product sourcing and trade opportunities',
      'Supplier and buyer coordination',
      'Logistics and documentation support',
    ],
  },

  Construction: {
    eyebrow: 'CONSTRUCTION',
    description:
      'Professional construction support for projects that require dependable execution, coordination and attention to quality.',
    points: [
      'Residential and commercial construction',
      'Project planning and coordination',
      'Execution and site support',
      'Quality-focused project delivery',
    ],
  },

  'Utility Services': {
    eyebrow: 'UTILITY SERVICES',
    description:
      'Practical utility solutions and support services designed to help clients manage essential requirements efficiently.',
    points: [
      'Utility-related service coordination',
      'Site and requirement assessment',
      'Maintenance and support solutions',
      'Reliable service coordination',
    ],
  },

  'Contractor Services': {
    eyebrow: 'CONTRACTOR SERVICES',
    description:
      'Dependable contractor services for clients looking for professional execution, coordination and project support.',
    points: [
      'General contractor support',
      'Project execution and coordination',
      'Skilled work and site management',
      'Flexible solutions based on project needs',
    ],
  },

  'Car Sale & Purchase': {
    eyebrow: 'AUTOMOTIVE SERVICES',
    description:
      'Assistance with car sale and purchase requirements, helping clients explore suitable vehicles and manage the transaction process.',
    points: [
      'Car buying and selling assistance',
      'Vehicle opportunity sourcing',
      'Buyer and seller coordination',
      'Transaction support and guidance',
    ],
  },
};

export default function ServiceDetail({ service, onBack, onEnquire }) {
  if (!service) return null;

  const Icon = ICONS[service.icon] ?? Building2;
  const details = SERVICE_DETAILS[service.title] ?? {
    eyebrow: 'EKADANTA TRADERS',
    description: service.description,
    points: [],
  };

  const handleEnquire = () => {
    onEnquire(service.title);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-navy-950">
      {/* Future video/image background area */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,175,55,0.16),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(30,58,138,0.18),transparent_40%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/90 to-navy-950" />

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-mist backdrop-blur transition hover:border-gold-400/50 hover:text-gold-300"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Services
        </button>

        <div className="grid min-h-[calc(100vh-140px)] items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          {/* Left content */}
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gold-500/30 bg-gold-500/[0.06] px-4 py-2 text-xs font-semibold tracking-[0.2em] text-gold-300">
              <Icon className="h-4 w-4" />
              {details.eyebrow}
            </div>

            <h1 className="font-display text-4xl leading-tight text-pearl sm:text-5xl lg:text-6xl">
              {service.title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-mist sm:text-lg">
              {details.description}
            </p>

            <div className="mt-10">
              <h2 className="font-display text-2xl text-pearl">
                How we can help
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {details.points.map((point) => (
                  <div
                    key={point}
                    className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-4 text-sm leading-relaxed text-mist backdrop-blur"
                  >
                    <span className="mr-2 text-gold-400">✦</span>
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleEnquire}
              className="btn-gold mt-10 min-w-48"
            >
              ENQUIRE NOW
            </button>
          </div>

          {/* Future media / enquiry visual area */}
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-gold-500/20 bg-white/[0.035] shadow-2xl backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.12),transparent_45%)]" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-gold-500/30 bg-gold-500/[0.08] text-gold-300">
                  <Icon className="h-11 w-11" />
                </div>

                <h3 className="mt-7 font-display text-2xl text-pearl">
                  {service.title}
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-7 text-mist">
                  Premium visual content for this service will be added here.
                </p>

                <div className="mt-7 h-px w-24 bg-gold-500/40" />

                <p className="mt-6 text-xs uppercase tracking-[0.2em] text-gold-300/80">
                  EKADANTA TRADERS
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
