import Seo from '../components/Seo';
import ServicesList from '../components/ServicesList';
import Button from '../components/Button';

// Secondary, long-form list of the seven services. Linked from About and the footer;
// deliberately not a nav item.
export default function Services() {
  return (
    <main id="main" className="page services">
      <Seo
        title="Hizmetler"
        description="Marka kimliği & logo sistemleri, tipografi, içerik geliştirme, geleneksel & dijital sanat entegrasyonu, editöryel & baskılı tasarım, kreatif danışmanlık ve sanat üretimi."
        path="/services/"
      />
      <section className="services__inner wrap" aria-labelledby="services-title">
        <p className="eyebrow">Hizmetler</p>
        <h1 id="services-title" className="services__title">Yedi başlık.</h1>
        <ServicesList />
        <div className="services__cta" data-reveal>
          <Button href="/contact/" surface="outline">Proje Başlat</Button>
        </div>
      </section>
    </main>
  );
}
