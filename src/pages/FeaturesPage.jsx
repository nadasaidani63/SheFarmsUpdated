import Header from '../components/Header';
import Footer from '../components/Footer';
import UiIcon from '../components/UiIcon';
import { Link } from 'react-router-dom';
import '../App.css';
import './ReferencePages.css';

const modules = [
  ['tasks', 'Overview Dashboard', 'Farm indicators, soil health, weather, alerts, and quick access to every workspace module.'],
  ['check', 'Task Management', 'Create, filter, assign, and track planting, irrigation, harvest, and maintenance tasks.'],
  ['calendar', 'Agricultural Calendar', 'Coordinate monthly planting, irrigation, fertilization, and harvest activities.'],
  ['soil', 'Soil Analysis & Recommendations', 'Record manual and virtual sensor readings for soil pH, moisture, and organic matter.'],
  ['drone', 'Drone & IoT Monitoring', 'Review sensor status and analyze crop imagery with the existing AI service.'],
  ['chart', 'Agricultural Analytics', 'Explore soil trends, crop comparisons, and farm performance indicators.'],
  ['trend', 'Financial Management', 'Track cooperative income, expenses, savings goals, and transactions.'],
  ['learning', 'Learning & Development', 'Access practical courses, guides, learning progress, and certificates.'],
  ['users', 'Community & Resource Sharing', 'Connect women farmers through shared resources, mentorship, and community updates.'],
  ['community', 'Community Mobility', 'Coordinate safe shared transport between members and trusted local drivers.'],
];

export default function FeaturesPage() {
  return (
    <div className="app public-page reference-page features-page">
      <Header currentPage="features" />
      <main className="reference-page-main">
        <section className="reference-page-intro">
          <p className="reference-eyebrow">Complete suite</p>
          <h1>Ten Modules Engineered for Rural Impact</h1>
          <p>Explore the tools that bring everyday farm operations together in one cooperative workspace.</p>
        </section>
        <section className="reference-module-grid">
          {modules.map(([icon, title, description]) => (
            <article className="reference-module-card" key={title}>
              <div className="reference-icon-box"><UiIcon name={icon} size={22} /></div>
              <h2>{title}</h2>
              <p>{description}</p>
              <Link to="/dashboard">Open in dashboard <UiIcon name="arrow" size={15} /></Link>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
