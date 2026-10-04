import { useCallback, useState } from 'react';
import Contact from './Contact.jsx';
import Footer from './Footer.jsx';
import Header from './Header.jsx';
import Hero from './Hero.jsx';
import Services from './Services.jsx';
import WhatsAppFloat from './WhatsAppFloat.jsx';

export default function App() {
  // Every "ENQUIRE NOW" button calls openEnquiry(). The form listens to `request`,
  // pre-selects the service, and takes focus.
  const [request, setRequest] = useState({ service: '', nonce: 0 });

  const openEnquiry = useCallback((service = '') => {
    setRequest((current) => ({ service, nonce: current.nonce + 1 }));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('enquiry')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }, []);

  return (
    <>
      <Header onEnquire={openEnquiry} />
      <main>
        <Hero onEnquire={openEnquiry} />
        <Services onEnquire={openEnquiry} />
        <Contact request={request} />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
