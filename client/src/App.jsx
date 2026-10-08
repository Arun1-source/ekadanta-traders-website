import { useCallback, useEffect, useState } from 'react';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import ServiceDetail from './components/ServiceDetail.jsx';
import WhatsAppFloat from './components/WhatsAppFloat.jsx';
import Reviews from './components/Reviews.jsx';
import AdminReviews from './components/AdminReviews.jsx';
import { SERVICES } from './config/site.js';

const BASE_TITLE = 'EKADANTA TRADERS | Property, Import & Export, Construction, Utility, Contractor and Car Services';
const serviceFromPath = (pathname) => {
  const id = pathname.match(/^\/services\/([a-z0-9-]+)\/?$/)?.[1];
  return SERVICES.find((service) => service.id === id) ?? null;
};
const scrollTo = (id) => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
};

export default function App() {
  if (window.location.pathname === '/admin/reviews') return <AdminReviews />;
  return <Website />;
}

function Website() {
  const [request, setRequest] = useState({ service: '', nonce: 0 });
  const [activeService, setActiveService] = useState(() => serviceFromPath(window.location.pathname));

  useEffect(() => {
    const syncRoute = () => setActiveService(serviceFromPath(window.location.pathname));
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  useEffect(() => {
    document.title = activeService ? `${activeService.title} | EKADANTA TRADERS` : BASE_TITLE;
  }, [activeService]);

  const openEnquiry = useCallback((service = '') => {
    setRequest((current) => ({ service, nonce: current.nonce + 1 }));
    if (window.location.pathname !== '/' || window.location.hash !== '#contact') {
      window.history.pushState({}, '', '/#contact');
    }
    setActiveService(null);
    window.requestAnimationFrame(() => scrollTo('enquiry'));
  }, []);

  const openService = useCallback((service) => {
    window.history.pushState({}, '', `/services/${service.id}`);
    setActiveService(service);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const showHome = useCallback((section = 'top') => {
    window.history.pushState({}, '', section === 'top' ? '/#top' : `/#${section}`);
    setActiveService(null);
    window.requestAnimationFrame(() => scrollTo(section));
  }, []);

  return (
    <>
      <Header onEnquire={openEnquiry} onShowHome={showHome} />
      <main>
        {activeService ? (
          <ServiceDetail service={activeService} onBack={() => showHome('services')} onEnquire={openEnquiry} />
        ) : (
          <>
            <Hero onEnquire={openEnquiry} />
            <Services onEnquire={openEnquiry} onView={openService} />
          </>
        )}
        <Contact request={request} />
        <Reviews />
      </main>
      <Footer onShowHome={showHome} />
      <WhatsAppFloat />
    </>
  );
}
