import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UiIcon from '../components/UiIcon';
import '../App.css';
import './ReferencePages.css';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '');
    const message = String(form.get('message') || '').trim();
    if (!String(form.get('name') || '').trim() || !email.includes('@') || message.length < 10) {
      setError('Please enter your name, a valid email address, and a message of at least 10 characters.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="app public-page reference-page contact-page">
      <Header currentPage="contact" />
      <main className="reference-page-main contact-layout">
        <section className="reference-contact-copy">
          <p className="reference-eyebrow">Get in touch</p>
          <h1>Connect With SheFarms</h1>
          <p>Interested in working with SheFarms or learning more about the platform? Send us a message and our team will be glad to connect.</p>
          <div className="reference-contact-details">
            <div><UiIcon name="map" /><span>Tunis &amp; Béja, Tunisia</span></div>
            <div><UiIcon name="mail" /><span>contact@shefarms.tn</span></div>
            <div><UiIcon name="phone" /><span>+216 71 000 420</span></div>
          </div>
        </section>
        <section className="reference-contact-card">
          {submitted ? (
            <div className="reference-contact-success">
              <UiIcon name="completed" size={42} />
              <h2>Thank you for reaching out</h2>
              <p>Your message was recorded in this frontend demonstration. No external email service is connected.</p>
              <button type="button" onClick={() => setSubmitted(false)}>Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2>Send us a message</h2>
              <div className="reference-form-row">
                <label>Full name<input name="name" autoComplete="name" placeholder="Your name" /></label>
                <label>Email<input name="email" type="email" autoComplete="email" placeholder="name@example.tn" /></label>
              </div>
              <label>Subject<input name="subject" placeholder="How can we help?" /></label>
              <label>Message<textarea name="message" rows="5" placeholder="Write your message" /></label>
              {error && <p className="reference-form-error" role="alert">{error}</p>}
              <button type="submit">Send message <UiIcon name="arrow" size={16} /></button>
              <p className="reference-form-note">This demonstration form does not send email to an external service.</p>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
