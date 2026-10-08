import { SERVICES } from '../config/site.js';
import ServiceCard from './ServiceCard.jsx';

export default function Services({ onEnquire, onView }) {
  return (
    <section id="services" className="relative scroll-mt-16 bg-navy-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl leading-tight text-pearl sm:text-5xl">What we work on</h2>
          <p className="mt-4 text-base leading-relaxed text-mist sm:text-lg">
            Explore a service or go straight to the enquiry form. Choosing a service pre-selects it in your enquiry.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} onEnquire={onEnquire} onView={onView} />
          ))}
        </div>
      </div>
    </section>
  );
}
