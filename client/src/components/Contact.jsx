import { Mail, Phone } from 'lucide-react';
import { COMPANY, WHATSAPP_URL } from '../config/site.js';
import EnquiryForm from './EnquiryForm.jsx';
import { InstagramIcon, WhatsAppIcon } from './Icons.jsx';

function ContactCard({ icon, label, children }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/50 bg-navy-950/70 text-gold-300">{icon}</span>
        <h3 className="text-sm font-semibold tracking-[0.12em] text-gold-300">{label}</h3>
      </div>
      <div className="mt-3 flex flex-col">{children}</div>
    </div>
  );
}

const linkClass = 'rounded-md py-2 text-lg text-pearl transition-colors hover:text-gold-300 break-words';

export default function Contact({ request }) {
  return (
    <section id="contact" className="relative scroll-mt-16 overflow-hidden bg-navy-900 py-20 sm:py-28">
      <div className="jaali pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl leading-tight text-pearl sm:text-5xl">Talk to us</h2>
          <p className="mt-4 text-base leading-relaxed text-mist sm:text-lg">
            Send an enquiry and it reaches our team directly, or reach us on call, email, WhatsApp or Instagram.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div id="enquiry" className="glass order-1 scroll-mt-24 rounded-2xl p-6 sm:p-8 lg:order-2 lg:col-span-3">
            <h3 className="font-display text-2xl text-pearl">Send an enquiry</h3>
            <div className="mt-6">
              <EnquiryForm request={request} />
            </div>
          </div>

          <div className="order-2 space-y-4 lg:order-1 lg:col-span-2">
            <ContactCard icon={<Phone className="h-5 w-5" aria-hidden="true" />} label="CALL US">
              {COMPANY.phones.map((phone) => (
                <a key={phone.tel} href={`tel:${phone.tel}`} className={linkClass}>
                  {phone.display}
                </a>
              ))}
            </ContactCard>

            <ContactCard icon={<Mail className="h-5 w-5" aria-hidden="true" />} label="EMAIL US">
              <a href={`mailto:${COMPANY.email}`} className={linkClass}>
                {COMPANY.email}
              </a>
            </ContactCard>

            <ContactCard icon={<InstagramIcon />} label="INSTAGRAM">
              <a href={COMPANY.instagram.url} target="_blank" rel="noopener noreferrer" className={linkClass} aria-label={`${COMPANY.instagram.handle} on Instagram (opens in a new tab)`}>
                {COMPANY.instagram.handle}
              </a>
            </ContactCard>

            <ContactCard icon={<WhatsAppIcon />} label="WHATSAPP">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-outline mt-1 w-full" aria-label={`Chat on WhatsApp with ${COMPANY.whatsapp.display} (opens in a new tab)`}>
                Chat on WhatsApp
              </a>
            </ContactCard>
          </div>
        </div>
      </div>
    </section>
  );
}
