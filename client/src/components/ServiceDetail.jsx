import {
  ArrowLeft,
  Building2,
  Car,
  CheckCircle2,
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
    tagline: 'Helping you move forward with the right property opportunity.',
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
    tagline: 'Connecting products, opportunities and markets with confidence.',
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
    tagline: 'Building with planning, coordination and dependable execution.',
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
    tagline: 'Practical solutions for essential utility requirements.',
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
    tagline: 'Reliable project support from planning to execution.',
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
    tagline: 'Making vehicle buying and selling simpler and more confident.',
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
    tagline: 'Professional business solutions tailored to your requirements.',
    description: service.description,
    points: [],
  };

  const handleEnquire = () => {
    onEnquire(service.title);
  };

  return (
    <section className="relative overflow-hidden bg-navy-950">
      {/* Premium background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gold-500/[0.06] blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-gold-500/[0.05] to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-mist backdrop-blur transition duration-300 hover:border-gold-400/50 hover:bg-gold-400/[0.06] hover:text-gold-300 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          All Services
        </button>

        {/* Hero */}
        <div className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-gold-500/30 bg-gold-500/[0.06] px-4 py-2 text-xs font-semibold tracking-[0.2em] text-gold-300">
              <Icon className="h-4 w-4" />
              {details.eyebrow}
            </div>

            <p className="mt-7 text-sm font-medium uppercase tracking-[0.18em] text-gold-300/80">
              EKADANTA TRADERS
            </p>

            <h1 className="mt-3 max-w-4xl font-display text-4xl leading-[1.08] text-pearl sm:text-5xl lg:text-6xl xl:text-7xl">
              {service.title}
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-pearl/90 sm:text-2xl">
              {details.tagline}
            </p>

            <p className="mt-5 max-w-2xl text-base leading-8 text-mist sm:text-lg">
              {details.description}
            </p>

            <button
              type="button"
              onClick={handleEnquire}
              className="btn-gold mt-9 min-h-12 min-w-52 px-7"
            >
              ENQUIRE NOW
            </button>
          </div>

          {/* Service photo */}
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-gold-500/20 bg-white/[0.035] shadow-2xl">
              <img src={`/images/${service.id}.jpg`} alt={`${service.title} service`} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.15),transparent_45%)]" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-gold-500/30 bg-gold-500/[0.08] text-gold-300 shadow-lg">
                  <Icon className="h-11 w-11" />
                </div>

                <h2 className="mt-7 font-display text-2xl text-pearl sm:text-3xl">
                  {service.title}
                </h2>

                <p className="mt-4 max-w-sm text-sm leading-7 text-mist">
                  Share your requirement and our team can discuss practical next steps with you.
                </p>

                <div className="mt-7 h-px w-20 bg-gold-500/40" />

                <p className="mt-5 text-xs uppercase tracking-[0.25em] text-gold-300/70">
                  PREMIUM BUSINESS SOLUTIONS
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What we offer */}
        <div className="border-t border-white/10 pt-16 sm:pt-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-300">
              OUR CAPABILITIES
            </p>

            <h2 className="mt-3 font-display text-3xl text-pearl sm:text-4xl">
              What we can help with
            </h2>

            <p className="mt-4 leading-7 text-mist">
              We focus on understanding your requirement and providing
              practical support from initial discussion through coordination
              and execution.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {details.points.map((point) => (
              <div
                key={point}
                className="group rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-gold-500/30 hover:bg-gold-500/[0.035]"
              >
                <CheckCircle2 className="h-6 w-6 text-gold-400" />

                <p className="mt-5 text-sm leading-7 text-mist">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why choose us */}
        <div className="mt-20 rounded-3xl border border-gold-500/15 bg-gradient-to-br from-gold-500/[0.07] to-white/[0.025] p-8 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-300">
                WHY EKADANTA TRADERS
              </p>

              <h2 className="mt-3 font-display text-3xl leading-tight text-pearl sm:text-4xl">
                Business support built around your requirement.
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {[
                'Professional coordination',
                'Client-focused approach',
                'Clear communication',
                'Reliable service support',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" />

                  <span className="text-sm leading-7 text-mist">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-20 text-center sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-300">
            LET'S GET STARTED
          </p>

          <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl leading-tight text-pearl sm:text-4xl lg:text-5xl">
            Have a requirement? Let's discuss it.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-mist">
            Tell us what you are looking for and our team will get back to
            you.
          </p>

          <button
            type="button"
            onClick={handleEnquire}
            className="btn-gold mt-8 min-h-12 min-w-52 px-7"
          >
            START AN ENQUIRY
          </button>
        </div>
      </div>
    </section>
  );
}
