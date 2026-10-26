import React from 'react';
import { SECTIONS } from '../data/constants';
import { DashboardIcon, CheckIcon } from './Icons';

export function ReviewPanel({ profile, scores, submitting, onEdit, onBack, onSaveDraft, onSubmit, onGoDashboard }) {
  const percent = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const personal = profile?.personalDetails || {};
  const fullName = [personal.firstName, personal.middleName, personal.lastName]
    .filter(Boolean)
    .join(' ') || 'Faculty Member';

  return (
    <div className="column">
      <div className="panel">
        <h2 className="section-title">Review your profile</h2>
        <p style={{ marginBottom: 'var(--sp-4)', color: 'var(--ink-2)' }}>
          Check each section below before submitting. You can click any section to go back and edit it.
        </p>

        {/* Clean Checklist */}
        <div className="review-checklist">
          {SECTIONS.map((s, i) => {
            const isComplete = scores[i] === 100;
            const isPartial = scores[i] > 0 && scores[i] < 100;
            return (
              <div key={s.key} className="checklist-row" onClick={() => onEdit(i)}>
                <div className="checklist-left">
                  <span className="checklist-num">0{s.number}</span>
                  <span className="checklist-name">{s.name}</span>
                </div>
                <div className="checklist-right">
                  {isComplete ? (
                    <span className="status-complete"><CheckIcon size={16} /> Complete</span>
                  ) : isPartial ? (
                    <span className="status-incomplete">⚠ Incomplete ({scores[i]}%)</span>
                  ) : (
                    <span className="status-empty">— Not started</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="review-summary" style={{ marginTop: '32px' }}>
          <div style={{ marginBottom: '8px', fontWeight: 600, color: 'var(--ink)' }}>Profile completion</div>
          <div className="progress-pill progress-pill-lg">
            <div className="progress-bar" style={{ width: `${percent}%` }} />
            <span className="progress-label">{percent}% complete</span>
          </div>
        </div>
      </div>

      <div className="actionbar">
        <button type="button" className="btn btn-outline" onClick={onSaveDraft}>Save draft</button>
        <button type="button" className="btn btn-plain" onClick={onBack}>Back to Profile</button>
        <div className="actionbar-end">
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitting}
            onClick={onSubmit}
          >
            {submitting && <span className="spinner" />}
            {submitting ? 'Submitting…' : 'Submit profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubmittedPanel({ profile, onReopen, onReview, onDownload, onGoDashboard }) {
  const personal = profile?.personalDetails || {};
  const fullName = [personal.firstName, personal.middleName, personal.lastName]
    .filter(Boolean)
    .join(' ') || 'Faculty Member';

  return (
    <div className="column">
      <div className="panel submitted-panel">
        <div className="submitted-check"><CheckIcon size={24} color="#137333" /></div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>Profile submitted</h2>
        <p style={{ textAlign: 'center', color: 'var(--ink-2)', marginBottom: 'var(--sp-4)' }}>
          Your faculty profile has been successfully submitted for review by the department and college administration.
        </p>

        {/* Profile photo card */}
        <div className="review-profile-card" style={{ maxWidth: '400px', margin: '0 auto var(--sp-5)' }}>
          <div className="review-profile-photo-wrap">
            {personal.photoUrl ? (
              <img className="review-profile-photo" src={personal.photoUrl} alt={fullName} />
            ) : (
              <div className="review-profile-photo-placeholder">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="review-profile-info">
            <h3 className="review-profile-name">{fullName}</h3>
            {(personal.designation || personal.department) && (
              <p className="review-profile-role">
                {personal.designation}{personal.designation && personal.department ? ' • ' : ''}{personal.department}
              </p>
            )}
            {personal.officialEmail && (
              <p className="review-profile-email">{personal.officialEmail}</p>
            )}
          </div>
        </div>

        {profile.referenceNo && (
          <div className="notice notice-ok">
            <span>Reference number: <strong>{profile.referenceNo}</strong></span>
          </div>
        )}

        <div className="submitted-actions">
          {onGoDashboard && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onGoDashboard}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <DashboardIcon size={14} /> Go to Faculty Dashboard
            </button>
          )}
          <button type="button" className="btn btn-outline" onClick={onReview}>View summary</button>
          <button type="button" className="btn btn-outline" onClick={onDownload}>Download PDF</button>
          <button type="button" className="btn btn-plain" onClick={onReopen}>Reopen for editing</button>
        </div>
      </div>
    </div>
  );
}
