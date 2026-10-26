import React from 'react';

export function Settings() {
  return (
    <div className="column">
      <div className="panel">
        <h2 className="section-title">Settings</h2>
        <p style={{ marginBottom: 'var(--sp-4)', color: 'var(--ink-2)' }}>
          Manage your account, preferences, and security settings.
        </p>

        <div className="settings-section">
          <h3>Account</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="input" defaultValue="Faculty Member" disabled />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="input" defaultValue="faculty@college.edu.in" disabled />
          </div>
        </div>

        <hr style={{ margin: '32px 0', borderColor: 'var(--line)' }} />

        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
            <input type="checkbox" id="notif-email" defaultChecked />
            <label htmlFor="notif-email" style={{ margin: 0 }}>Email notifications for review updates</label>
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
            <input type="checkbox" id="notif-reminders" defaultChecked />
            <label htmlFor="notif-reminders" style={{ margin: 0 }}>Submission reminder emails</label>
          </div>
        </div>

        <hr style={{ margin: '32px 0', borderColor: 'var(--line)' }} />

        <div className="settings-section">
          <h3>Preferences</h3>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
            <input type="checkbox" id="pref-autosave" defaultChecked />
            <label htmlFor="pref-autosave" style={{ margin: 0 }}>Enable auto-save while editing profile</label>
          </div>
        </div>

        <hr style={{ margin: '32px 0', borderColor: 'var(--line)' }} />

        <div className="settings-section">
          <h3>Security</h3>
          <button type="button" className="btn btn-outline" style={{ marginTop: '8px' }}>Change Password</button>
        </div>
      </div>
    </div>
  );
}
