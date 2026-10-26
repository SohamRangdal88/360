import React, { useState, useRef, useEffect } from 'react';
import { SECTIONS } from '../data/constants';
import { DashboardIcon, EditIcon, DownloadIcon, CheckIcon, LogoutIcon } from './Icons';

/* ---------------------------------------------------------------- header */

export function AppHeader({ profile, percent, saveState, savedAt, view, onNavigate, onLogout, children, variant = 'faculty' }) {
  const p = profile.personalDetails || {};
  const name = variant === 'admin'
    ? 'Administration'
    : [p.firstName, p.lastName].filter(Boolean).join(' ') || 'New profile';

  const saveLabel =
    saveState === 'saving' ? 'Saving…' :
      saveState === 'saved' ? `Saved ${savedAt}` :
        saveState === 'offline' ? 'Saved on this device only' : '';

  return (
    <header className="app-header">
      <div className="app-header-inner" style={{ justifyContent: 'space-between', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="app-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/wit-logo.jpg" alt="WIT Logo" className="wit-logo-header" />
            <div style={{ width: '1px', height: '36px', background: 'rgba(18, 69, 95, 0.2)' }} />
            <img
              src="/faculty360-logo-cropped.png"
              alt="Faculty 360"
              style={{
                cursor: 'pointer',
                height: '28px',
                objectFit: 'contain',
                objectPosition: 'left center',
                mixBlendMode: 'multiply'
              }}
              onClick={() => onNavigate('dashboard')}
              title="Go to Dashboard"
            />
          </div>
        </div>

        <nav className="global-nav">
          {variant === 'admin' ? (
            <>
              <button className={`nav-link ${view === 'admin' ? 'active' : ''}`} onClick={() => onNavigate('admin')}>Faculty directory</button>
              <button className={`nav-link ${view === 'admin-reports' ? 'active' : ''}`} onClick={() => onNavigate('admin-reports')}>Reports</button>
            </>
          ) : (
            <>
              <button className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => onNavigate('dashboard')}>Dashboard</button>
              <button className={`nav-link ${view === 'form' ? 'active' : ''}`} onClick={() => onNavigate('form')}>Profile</button>
              <button className={`nav-link ${view === 'settings' ? 'active' : ''}`} onClick={() => onNavigate('settings')}>Settings</button>
            </>
          )}
        </nav>

        <div className="app-header-right">
          <span className="app-header-name" style={{ marginRight: '16px' }}>{name}</span>
          {variant !== 'admin' && <div 
            className="progress-pill clickable-pill" 
            onClick={() => onNavigate('review')}
            title="Review your profile progress"
            style={{ cursor: 'pointer' }}
          >
            <div className="progress-bar" style={{ width: `${percent}%` }} />
            <span className="progress-label">{percent}% Review</span>
          </div>}
          <span className="save-label">{saveLabel}</span>
          {children}
          {onLogout && (
            <button
              type="button"
              className="btn btn-plain btn-sm"
              style={{ color: 'rgba(18, 69, 95, 0.8)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}
              onClick={onLogout}
            >
              <LogoutIcon size={14} /> Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="app-footer">
      <span>Faculty 360</span>
      <span>Faculty profile management for WIT</span>
      <span>© {new Date().getFullYear()}</span>
    </footer>
  );
}

/* ------------------------------------------------------------ side nav */

export function SideNav({ active, scores, onSelect }) {
  return (
    <nav className="side-nav">
      <div className="side-nav-inner">
        <div className="side-nav-header">Profile Sections</div>
        {SECTIONS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className={`side-nav-item${i === active ? ' is-active' : ''}${scores[i] === 100 ? ' is-done' : ''}`}
            onClick={() => onSelect(i)}
          >
            <div className="side-nav-text">
              <span className="side-nav-num">{s.number}</span>
              <span className="side-nav-name">{s.name}</span>
            </div>
            {scores[i] === 100 && <CheckIcon size={16} className="side-nav-check" />}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* --------------------------------------------------------- download menu */

export function DownloadMenu({ onPickJson, onPickCsv, onPickHtml, onPickPdf }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="dl-wrap" ref={ref}>
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => setOpen(!open)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <DownloadIcon size={14} /> Download profile
      </button>
      {open && (
        <div className="dl-menu">
          <button type="button" onClick={() => { onPickPdf(); setOpen(false); }}>PDF (print)</button>
          <button type="button" onClick={() => { onPickHtml(); setOpen(false); }}>.html file</button>
          <button type="button" onClick={() => { onPickCsv(); setOpen(false); }}>.csv spreadsheet</button>
          <button type="button" onClick={() => { onPickJson(); setOpen(false); }}>.json backup</button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- confirm modal */

export function ConfirmModal({ title, message, confirmLabel, danger, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-plain" onClick={onCancel}>Cancel</button>
          <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UnsavedChangesModal({ sectionName, onSave, onDiscard, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EditIcon size={20} color="var(--brand)" /> Unsaved changes in {sectionName}
        </h2>
        <p className="modal-message">
          You have modified details in this section without saving. Would you like to save your changes before leaving?
        </p>
        <div className="modal-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-plain" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-outline" onClick={onDiscard}>
            Don't Save
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave}>
            Save & Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- toast */

export function Toast({ message, kind }) {
  return (
    <div className={`toast toast-${kind}`}>
      {message}
    </div>
  );
}
