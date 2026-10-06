import { COMPANY, WHATSAPP_URL } from '../config/site.js';
import { WhatsAppIcon } from './Icons.jsx';

export default function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp with ${COMPANY.whatsapp.display} (opens in a new tab)`}
      className="fixed right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/40 transition-transform hover:scale-105"
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
