import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import UiIcon from '../components/UiIcon';
import '../App.css';
import './HomePage.css';

const highlights = [
  { icon: 'sprout', title: 'Soil Intelligence', text: 'Track pH, moisture, and organic matter with guidance linked to actual measurements.' },
  { icon: 'drone', title: 'Drone & IoT Vision', text: 'Review field telemetry and use AI crop image analysis for field monitoring.' },
  { icon: 'community', title: 'Community Mobility', text: 'Coordinate safe, shared rural transport between women farmers and trusted local drivers.' },
  { icon: 'trend', title: 'Financial Management', text: 'Track cooperative income, expenses, net profit, and savings goals.' },
  { icon: 'calendar', title: 'Task & Calendar Operations', text: 'Plan planting, irrigation, fertilization, and harvests as a team.' },
  { icon: 'learning', title: 'Learning & Community', text: 'Access practical courses, digital skills, mentorship, and shared resources.' },
];

const architecture = ['User Interface', 'Agricultural Management System', 'Data Collection & Processing', 'IoT, Drone & AI Analysis', 'Agricultural Insights & Decision Support'];
const sdgs = [
  ['SDG 2', 'Zero Hunger', 'Precision soil diagnostics and crop planning support resilient harvests.'],
  ['SDG 5', 'Gender Equality', 'Designed around women farmers’ leadership and financial autonomy.'],
  ['SDG 8', 'Decent Work & Growth', 'Cooperative tracking and shared logistics strengthen rural livelihoods.'],
  ['SDG 9', 'Industry & Innovation', 'Accessible sensor telemetry, drone imagery, and AI vision bring modern tools to rural plots.'],
  ['SDG 12', 'Responsible Production', 'Targeted fertilization and irrigation help reduce waste.'],
  ['SDG 13', 'Climate Action', 'Weather-aware scheduling and soil moisture tracking support adaptation.'],
  ['SDG 15', 'Life on Land', 'Organic matter monitoring helps protect Mediterranean soils.'],
];

export default function HomePage() {
  return (
    <div className="app home-app">
      <Header currentPage="home" />
      <main className="home-main">
        <section className="home-hero">
          <div className="home-hero-image" role="img" aria-label="Women farmers working together in a field" />
          <div className="home-hero-content">
            <p className="home-kicker">Tunisian &amp; North African AgriTech</p>
            <h1>Growing Together. Empowering Women. Transforming Agriculture.</h1>
            <p className="home-intro">
              SheFarms connects women farmers with intelligent agricultural tools, shared resources, and community-driven opportunities to build more productive and sustainable rural communities.
            </p>
            <div className="home-actions">
              <Link to="/dashboard" className="home-button home-button-primary">Explore the Platform <UiIcon name="arrow" size={17} /></Link>
              <Link to="/about" className="home-button home-button-secondary">Discover Our Mission</Link>
            </div>
            <div className="home-trust-line"><span /> Built for collaboration, designed for the field</div>
          </div>
        </section>

        <section className="home-problem-section">
          <div className="home-problem-copy">
            <p className="home-kicker">The SheFarms approach</p>
            <h2>Bridging Rural Reality and Precision Engineering</h2>
            <p><strong>The challenge:</strong> Women are the backbone of rural agriculture across Tunisia and North Africa, yet often have fragmented access to soil diagnostics, climate information, financial tools, and safe transport to fields.</p>
            <p><strong>The SheFarms solution:</strong> One connected agricultural workspace combining soil analytics, drone and IoT monitoring, task and calendar coordination, financial tracking, practical learning, and community mobility.</p>
          </div>
          <div className="home-problem-image" role="img" aria-label="Women meeting in a Tunisian rural courtyard" />
        </section>

        <section className="home-intro-section">
          <div className="home-section-heading">
            <h2>Integrated Platform Modules</h2>
            <p>Every module is designed to work together in one cohesive agricultural workspace.</p>
          </div>
          <div className="home-benefits">
            {highlights.map((item, index) => (
              <article className="home-benefit-card" key={item.title}>
                <span className="home-benefit-number">0{index + 1}</span>
                <div className="home-benefit-icon"><UiIcon name={item.icon} size={22} /></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-architecture-section">
          <div className="home-section-heading home-section-centered">
            <h2>Technical Architecture Flow</h2>
            <p>From field telemetry and aerial imagery to useful decision support.</p>
          </div>
          <ol className="home-architecture-list">
            {architecture.map((step, index) => <li key={step}><UiIcon name="layers" size={18} /><span>{step}</span><small>0{index + 1}</small></li>)}
          </ol>
        </section>

        <section className="home-sdg-section">
          <div className="home-section-heading">
            <h2>Sustainable Development Goals Alignment</h2>
            <p>How SheFarms’ capabilities support seven UN Sustainable Development Goals.</p>
          </div>
          <div className="home-sdg-grid">
            {sdgs.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="home-community-band">
          <div><p className="home-kicker">One agricultural workspace</p><h2>Explore the tools and grow together.</h2></div>
          <Link to="/dashboard" className="home-button home-button-light">Launch Dashboard <UiIcon name="arrow" size={17} /></Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
