import { Phone } from 'lucide-react';
import { COMPANY } from './config.js';
import HeroArt from './HeroArt.jsx';

const delay = (ms) => ({ animationDelay: `${ms}ms` });

export default function Hero({ onEnquire }) {
  return (
    <section id="top" className="relative flex min-h-[100svh] items-end overflow-hidden bg-navy-950">
      <HeroArt />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/55 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950 to-transparent" aria-hidden="true" />
      <div className="jaali pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-24 pt-40 sm:pb-28">
        <h1 className="max-w-3xl animate-rise font-display text-4xl leading-[1.12] text-pearl sm:text-6xl lg:text-7xl" style={delay(80)}>
          Six businesses.
          <br />
          One company to call.
        </h1>
        <p className="mt-6 max-w-xl animate-rise text-base leading-relaxed text-mist sm:text-lg" style={delay(260)}>
          EKADANTA TRADERS works in property, import and export, construction, utility services, contracting and cars. Tell us what you need and our team will get back to you.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row" style={delay(440)}>
          <button type="button" className="btn-gold animate-rise px-8" style={delay(440)} onClick={() => onEnquire('')}>
            ENQUIRE NOW
          </button>
          <a href={`tel:${COMPANY.phones[0].tel}`} className="btn-outline animate-rise px-8" style={delay(520)}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call {COMPANY.phones[0].display}
          </a>
        </div>
      </div>
    </section>
  );
}
