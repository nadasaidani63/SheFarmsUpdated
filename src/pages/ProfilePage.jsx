import React from 'react';
import { Link } from 'react-router-dom';
import UiIcon from '../components/UiIcon';
import './ProfilePage.css';

const personalFields = [
  ['First name', 'Amina'],
  ['Last name', 'Mbeki'],
  ['Email address', 'amina.mbeki@shefarms.com'],
  ['Phone number', '+233 24 123 4567'],
];

const farmFields = [
  ['Farm name', 'Green Valley Cooperative'],
  ['Farm size', '15 hectares'],
  ['Primary crops', 'Maize, Sorghum, Groundnuts'],
  ['Years of experience', '12 years'],
];

function InformationCard({ title, fields }) {
  return (
    <section className="profile-card profile-information-card">
      <div className="profile-card-heading">
        <div>
          <p className="profile-eyebrow">Account details</p>
          <h2>{title}</h2>
        </div>
        <button className="profile-edit-button" type="button" aria-label={`Edit ${title}`}>
          <UiIcon name="edit" size={16} /> Edit
        </button>
      </div>
      <div className="profile-fields">
        {fields.map(([label, value]) => (
          <label className="profile-field" key={label}>
            <span>{label}</span>
            <input value={value} readOnly aria-label={label} />
          </label>
        ))}
      </div>
    </section>
  );
}

export default function ProfilePage() {
  return (
    <main className="profile-page">
      <div className="profile-layout">
        <header className="profile-page-header">
          <div>
            <p className="profile-eyebrow">Your SheFarms account</p>
            <h1>Profile & settings</h1>
            <p>Manage your member and farm information.</p>
          </div>
          <Link className="profile-back-link" to="/dashboard">
            <UiIcon name="tasks" size={16} /> Back to overview
          </Link>
        </header>

        <aside className="profile-sidebar">
          <section className="profile-card profile-identity-card">
            <div className="profile-avatar">AM</div>
            <p className="profile-eyebrow">Cooperative member</p>
            <h2>Amina Mbeki</h2>
            <p className="profile-role">Farmer &amp; Community Leader</p>
            <div className="profile-meta-list">
              <div><span>Member since</span><strong>January 2023</strong></div>
              <div><span>Location</span><strong>Tamale, Ghana</strong></div>
              <div><span>Community role</span><strong className="profile-role-tag">Leader</strong></div>
            </div>
          </section>

          <section className="profile-card profile-impact-card">
            <p className="profile-eyebrow">Community contribution</p>
            <h2>Your impact</h2>
            <div className="profile-stats-grid">
              <div className="profile-stat"><UiIcon name="users" /><strong>156</strong><span>Community members</span></div>
              <div className="profile-stat"><UiIcon name="drone" /><strong>23</strong><span>Drone surveys</span></div>
              <div className="profile-stat"><UiIcon name="trend" /><strong>85%</strong><span>Productivity</span></div>
              <div className="profile-stat"><UiIcon name="completed" /><strong>4.8</strong><span>Member rating</span></div>
            </div>
          </section>
        </aside>

        <div className="profile-content">
          <InformationCard title="Personal information" fields={personalFields} />
          <InformationCard title="Farm information" fields={farmFields} />

          <section className="profile-card profile-preferences-card">
            <div className="profile-card-heading">
              <div>
                <p className="profile-eyebrow">Make SheFarms yours</p>
                <h2>Preferences &amp; settings</h2>
              </div>
            </div>
            <div className="profile-preferences-grid">
              <div className="profile-preference-group">
                <h3><UiIcon name="bell" size={17} /> Notifications</h3>
                <label><input type="checkbox" defaultChecked /> Email notifications</label>
                <label><input type="checkbox" defaultChecked /> SMS alerts</label>
                <label><input type="checkbox" /> Weather updates</label>
              </div>
              <div className="profile-preference-group">
                <h3><UiIcon name="settings" size={17} /> Language &amp; region</h3>
                <label className="profile-select-label">Preferred language
                  <select defaultValue="English"><option>English</option><option>French</option><option>Hausa</option><option>Twi</option></select>
                </label>
                <label className="profile-select-label">Time zone
                  <select defaultValue="GMT (Ghana Standard Time)"><option>GMT (Ghana Standard Time)</option><option>WAT (West Africa Time)</option></select>
                </label>
              </div>
            </div>
          </section>
          <div className="profile-actions">
            <button className="profile-cancel-button" type="button">Cancel changes</button>
            <button className="profile-save-button" type="button">Save all changes</button>
          </div>
        </div>
      </div>
    </main>
  );
}
