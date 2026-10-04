import { SERVICES } from '../config/site.js';
import ServiceCard from './ServiceCard.jsx';

export default function Services({ onEnquire }) {
  return (
    <section id="services" className="relative scroll-mt-16 bg-navy-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl leading-tight text-pearl sm:text-5xl">What we work on</h2>
          <p className="mt-4 text-base leading-relaxed text-mist sm:text-lg">
            Choose the service you need and press ENQUIRE NOW. The enquiry form opens with that service already selected.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} onEnquire={onEnquire} />
          ))}
        </div>
      </div>
    </section>
  );
}
