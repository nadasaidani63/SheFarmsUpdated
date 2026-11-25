import Header from '../components/Header';
import Footer from '../components/Footer';
import UiIcon from '../components/UiIcon';
import { Link } from 'react-router-dom';
import '../App.css';
import './ReferencePages.css';

const pillars = [
  { icon: 'search', title: 'Our mission', text: 'Equip women farmers with accessible precision agriculture tools, financial clarity, and safe community transport.' },
  { icon: 'eye', title: 'Our vision', text: 'A resilient North African rural economy led by connected, digitally empowered women cooperatives.' },
  { icon: 'community', title: 'Our values', text: 'Solidarity, scientific honesty, cultural dignity, environmental stewardship, and rural inclusion.' },
];

export default function AboutPage() {
  return (
    <div className="app public-page reference-page about-page">
      <Header currentPage="about" />
      <main className="reference-page-main">
        <section className="reference-page-intro">
          <p className="reference-eyebrow">Our story</p>
          <h1>Rooted in Tunisian Soil, Built for Tomorrow</h1>
          <p>Across Béja, Siliana, Nabeul, Kairouan, and rural communities throughout North Africa, women sustain olive groves, cereal fields, and family orchards. SheFarms brings engineering precision to their daily work while respecting local cooperative culture.</p>
        </section>
        <section className="reference-pillar-grid">
          {pillars.map((pillar) => (
            <article className="reference-pillar-card" key={pillar.title}>
              <div className="reference-icon-box"><UiIcon name={pillar.icon} size={23} /></div>
              <h2>{pillar.title}</h2>
              <p>{pillar.text}</p>
            </article>
          ))}
        </section>
        <section className="reference-about-band">
          <article>
            <div className="reference-section-icon"><UiIcon name="sprout" /></div>
            <h2>Digital Transformation of Rural Agriculture</h2>
            <p>By bringing soil sensor data, aerial crop analysis, farm calendars, and financial records together, SheFarms turns scattered notes into clear, useful farm insights.</p>
          </article>
          <article>
            <div className="reference-section-icon"><UiIcon name="map" /></div>
            <h2>Built for Tunisia &amp; North Africa</h2>
            <p>Water conscious Mediterranean farming, cooperative workflows, and shared transport tools address everyday needs of rural women across the region.</p>
          </article>
        </section>
        <div className="reference-page-action"><Link to="/dashboard" className="reference-primary-link">Explore the platform <UiIcon name="arrow" size={16} /></Link></div>
      </main>
      <Footer />
    </div>
  );
}
