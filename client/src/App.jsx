import { useCallback, useState } from 'react';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import WhatsAppFloat from './components/WhatsAppFloat.jsx';
import Reviews from './components/Reviews.jsx';
import AdminReviews from './components/AdminReviews.jsx';

export default function App() {
  if (window.location.pathname === '/admin/reviews') return <AdminReviews />;
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
        <Reviews />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
