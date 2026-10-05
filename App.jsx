import Reviews from './Reviews.jsx';
import { useCallback, useState } from 'react';
import Contact from './Contact.jsx';
import Footer from './Footer.jsx';
import Header from './Header.jsx';
import Hero from './Hero.jsx';
import Services from './Services.jsx';
import ServiceDetail from './ServiceDetail.jsx';
import WhatsAppFloat from './WhatsAppFloat.jsx';

export default function App() {
  const [request, setRequest] = useState({ service: '', nonce: 0 });
  const [selectedService, setSelectedService] = useState(null);

  const openEnquiry = useCallback((service = '') => {
    setRequest((current) => ({
      service,
      nonce: current.nonce + 1,
    }));

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    setTimeout(() => {
      document.getElementById('enquiry')?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }, 50);
  }, []);

  const openService = useCallback((service) => {
    setSelectedService(service);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const closeService = useCallback(() => {
    setSelectedService(null);

    setTimeout(() => {
      document.getElementById('services')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }, []);

  return (
    <>
      <Header onEnquire={openEnquiry} />

      <main>
        {selectedService ? (
          <>
            <ServiceDetail
              service={selectedService}
              onBack={closeService}
              onEnquire={openEnquiry}
            />

            <Contact
              request={{
                ...request,
                service: selectedService.title,
              }}
            />
          </>
        ) : (
          <>
            <Hero onEnquire={openEnquiry} />

            <Services
              onEnquire={openEnquiry}
              onOpenService={openService}
            />

            <Contact request={request} />
            <Reviews />
          </>
        )}
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  );
}
