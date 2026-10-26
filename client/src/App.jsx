import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { AppHeader, AppFooter, SideNav, DownloadMenu, ConfirmModal, Toast, UnsavedChangesModal } from './components/Chrome';
import { ReviewPanel, SubmittedPanel } from './components/ReviewPanel';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Settings } from './components/Settings';
import { DashboardIcon } from './components/Icons';
import {
  PersonalSection, ContactSection, QualificationSection
} from './sections/SectionsIdentity';
import {
  ProfessionalSection, IndustryTrainingSection, ProgramSection
} from './sections/SectionsExperience';
import {
  PublicationSection, PatentSection, AwardSection
} from './sections/SectionsResearch';
import {
  FinancialSupportSection, ProjectSection, CourseSection
} from './sections/SectionsFunding';

import { SECTIONS } from './data/constants';
import { emptyProfile, blankRecord, withRowIds } from './data/blank';
import { setIn } from './utils/helpers';
import { computeScores, overallPercent } from './utils/completion';
import { validateSection } from './utils/validate';
import { downloadJson, downloadCsv, downloadHtml, printProfile } from './utils/download';
import * as api from './api/facultyApi';

const STORED_EMAIL_KEY = 'faculty360:account-email';
const storedEmail = localStorage.getItem(STORED_EMAIL_KEY) || '';
const FACULTY_ID = localStorage.getItem('faculty360:account-id') || 'FAC-LOCAL';
const DRAFT_KEY = `faculty360:${FACULTY_ID}`;

const SECTION_COMPONENTS = [
  PersonalSection, ContactSection, QualificationSection, ProfessionalSection,
  IndustryTrainingSection, ProgramSection, PublicationSection, PatentSection,
  AwardSection, FinancialSupportSection, ProjectSection, CourseSection
];

export default function App() {
  const [profile, setProfile] = useState(() => ({ ...emptyProfile(), facultyId: FACULTY_ID }));
  const [facultyId, setFacultyId] = useState(FACULTY_ID);
  const [tab, setTab] = useState(0);
  const [errors, setErrors] = useState({});
  const [openRows, setOpenRows] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState('faculty');
  const [view, setView] = useState('auth'); // auth | dashboard | form | review | submitted | settings
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [unsavedPrompt, setUnsavedPrompt] = useState(null);
  const [saveState, setSaveState] = useState('saved');
  const [savedAt, setSavedAt] = useState('');
  const [uploading, setUploading] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(Boolean(storedEmail));

  const firstRender = useRef(true);
  const lastSavedProfileRef = useRef(null);

  const notify = useCallback((message, kind = 'ok') => setToast({ message, kind }), []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tab, view]);

  /* ------------------------------------------------------------ first load */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!storedEmail) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const result = await api.getProfileByEmail(storedEmail);
        const fromServer = result.profile;
        if (!cancelled) {
          const loaded = withRowIds({ ...emptyProfile(), ...fromServer });
          setFacultyId(loaded.facultyId);
          localStorage.setItem('faculty360:account-id', loaded.facultyId);
          setProfile(loaded);
          lastSavedProfileRef.current = JSON.parse(JSON.stringify(loaded));
          setSaveState('saved');
          setSavedAt('on the server');
        }
      } catch {
        // no API reachable: fall back to local draft
        const local = localStorage.getItem(DRAFT_KEY);
        if (!cancelled && local) {
          try {
            const parsed = JSON.parse(local);
            const loaded = withRowIds({ ...emptyProfile(), ...parsed });
            setProfile(loaded);
            lastSavedProfileRef.current = JSON.parse(JSON.stringify(loaded));
          } catch {
            /* ignore */
          }
        }
        if (!cancelled) {
          if (!lastSavedProfileRef.current) {
            lastSavedProfileRef.current = JSON.parse(JSON.stringify(emptyProfile()));
          }
          setSaveState('offline');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  /* -------------------------------------------------------- state mutators */

  const set = useCallback((path, value) => {
    setProfile((prev) => setIn(prev, path, value));
  }, []);

  const setRecord = useCallback((listKey, index, field, value) => {
    setProfile((prev) => setIn(prev, [listKey, index, field], value));
  }, []);

  const addRecord = useCallback((listKey) => {
    const record = blankRecord[listKey]();
    setProfile((prev) => ({
      ...prev,
      [listKey]: [...prev[listKey], record],
      notApplicable: { ...prev.notApplicable, [listKey]: false }
    }));
    setOpenRows((prev) => ({ ...prev, [record.rowId]: true }));
    notify('Record added. Fill in the details below.');
  }, [notify]);

  const deleteRecord = useCallback((listKey, index, label) => {
    setConfirm({
      title: 'Delete this record?',
      message: `${label} will be removed from your profile. This cannot be undone.`,
      confirmLabel: 'Delete record',
      danger: true,
      onConfirm: () => {
        setProfile((prev) => ({ ...prev, [listKey]: prev[listKey].filter((_, i) => i !== index) }));
        notify('Record deleted.', 'error');
      }
    });
  }, [notify]);

  const setNotApplicable = useCallback((listKey, value) => {
    setProfile((prev) => ({ ...prev, notApplicable: { ...prev.notApplicable, [listKey]: value } }));
  }, []);

  const toggleRow = useCallback((rowId) => {
    setOpenRows((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
  }, []);

  /* ----------------------------------------------------------- file uploads */

  const readAsDataUrl = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  const uploadPhoto = useCallback(async (file) => {
    if (!file) {
      set(['personalDetails', 'photoUrl'], '');
      return;
    }
    setUploading('photo');
    try {
      const saved = await api.uploadFile(file);
      set(['personalDetails', 'photoUrl'], saved.filePath);
    } catch {
      set(['personalDetails', 'photoUrl'], await readAsDataUrl(file));
      notify('Photo kept in this browser. It will upload when the server is reachable.', 'error');
    } finally {
      setUploading(null);
    }
  }, [set, notify]);

  /* wraps setRecord so a File turns into stored file metadata */
  const setRecordWithUpload = useCallback(async (listKey, index, field, value) => {
    if (value instanceof File) {
      setUploading(`${listKey}.${index}`);
      try {
        const saved = await api.uploadFile(value);
        setRecord(listKey, index, field, { mode: 'file', url: '', ...saved });
      } catch {
        setRecord(listKey, index, field, {
          mode: 'file', url: '', fileName: value.name, fileSize: value.size, filePath: ''
        });
        notify('File recorded locally. It will upload when the server is reachable.', 'error');
      } finally {
        setUploading(null);
      }
      return;
    }
    setRecord(listKey, index, field, value);
  }, [setRecord, notify]);

  /* ------------------------------------------------------------ derived data */

  const scores = useMemo(() => computeScores(profile), [profile]);
  const percent = useMemo(() => overallPercent(scores), [scores]);

  const err = useCallback(
    (listKey, index, field) => errors[`${listKey}.${index}.${field}`],
    [errors]
  );

  const ctx = {
    p: profile,
    set,
    errors,
    err,
    setRecord: (listKey, index, field, value) =>
      value instanceof File
        ? setRecordWithUpload(listKey, index, field, value)
        : setRecord(listKey, index, field, value),
    addRecord,
    deleteRecord,
    setNotApplicable,
    isOpen: (rowId) => Boolean(openRows[rowId]),
    toggleRow,
    uploadPhoto,
    uploading,
    notify
  };

  /* ------------------------------------------------------------- unsaved changes check */

  const isSectionDirty = useCallback((tabIndex) => {
    if (!lastSavedProfileRef.current) return false;
    const key = SECTIONS[tabIndex]?.key;
    if (!key) return false;
    const currentJson = JSON.stringify(profile[key] ?? null);
    const savedJson = JSON.stringify(lastSavedProfileRef.current[key] ?? null);
    return currentJson !== savedJson;
  }, [profile]);

  const withUnsavedCheck = useCallback((onProceedAction) => {
    if (view === 'form' && isSectionDirty(tab)) {
      const sectionName = SECTIONS[tab]?.name || 'current section';
      const sectionKey = SECTIONS[tab]?.key;

      setUnsavedPrompt({
        sectionName,
        onSave: async () => {
          setUnsavedPrompt(null);
          await saveDraft();
          onProceedAction();
        },
        onDiscard: () => {
          setUnsavedPrompt(null);
          if (sectionKey && lastSavedProfileRef.current) {
            setProfile((prev) => ({
              ...prev,
              [sectionKey]: JSON.parse(JSON.stringify(lastSavedProfileRef.current[sectionKey]))
            }));
          }
          onProceedAction();
        }
      });
      return;
    }
    onProceedAction();
  }, [view, tab, isSectionDirty, profile]);

  /* ------------------------------------------------------------- auth handlers */

  const handleLogin = async ({ email }) => {
    localStorage.setItem(STORED_EMAIL_KEY, email.toLowerCase());
    const isAdmin = ['admin@college.edu.in', 'cse.admin@college.edu.in'].includes(email.toLowerCase());
    if (isAdmin) {
      setIsAuthenticated(true);
      setRole('admin');
      localStorage.setItem('faculty360:admin-email', email.toLowerCase());
      setView('admin');
      notify('Welcome to the administration workspace.');
      return;
    }
    try {
      const result = await api.getProfileByEmail(email);
      const loaded = withRowIds({ ...emptyProfile(), ...result.profile });
      setProfile(loaded);
      setFacultyId(loaded.facultyId);
      localStorage.setItem('faculty360:account-id', loaded.facultyId);
    } catch {
      notify('Unable to load your faculty record. Please try again.', 'error');
      return;
    }
    setIsAuthenticated(true);
    setRole('faculty');
    if (profile.status === 'submitted') {
      setView('dashboard');
      notify(`Welcome back! Logged in as ${email || 'Faculty'}`);
    } else {
      setView('form');
      notify('Please complete and submit your profile form to access your Dashboard.');
    }
  };

  const handleRegister = async ({ email, firstName, lastName, officialEmail, department, designation }) => {
    setIsAuthenticated(true);
    let derivedFirst = firstName || '';
    let derivedLast = lastName || '';
    const regEmail = email || officialEmail || '';
    if (!derivedFirst && regEmail) {
      const parts = regEmail.split('@')[0].split(/[._-]/);
      derivedFirst = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Faculty';
      derivedLast = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : '';
    }

    const newProfile = {
      ...emptyProfile(),
      status: 'draft',
      facultyId: `FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      personalDetails: {
        ...emptyProfile().personalDetails,
        firstName: derivedFirst,
        lastName: derivedLast,
        officialEmail: regEmail,
        department: department || '',
        designation: designation || ''
      }
    };
    localStorage.setItem(STORED_EMAIL_KEY, regEmail.toLowerCase());
    try {
      const result = await api.getProfileByEmail(regEmail);
      const accountProfile = withRowIds({ ...emptyProfile(), ...result.profile });
      accountProfile.personalDetails = {
        ...accountProfile.personalDetails,
        ...newProfile.personalDetails
      };
      setFacultyId(accountProfile.facultyId);
      localStorage.setItem('faculty360:account-id', accountProfile.facultyId);
      setProfile(accountProfile);
      lastSavedProfileRef.current = JSON.parse(JSON.stringify(accountProfile));
    } catch {
      localStorage.setItem('faculty360:account-id', newProfile.facultyId);
      setFacultyId(newProfile.facultyId);
      setProfile(newProfile);
      lastSavedProfileRef.current = JSON.parse(JSON.stringify(newProfile));
    }
    setTab(0);
    setView('form');
    notify('Account created! Let\'s start by completing your profile details.');
  };

  const handleDemoLogin = () => {
    setRole('faculty');
    setIsAuthenticated(true);
    if (profile.status !== 'submitted') {
      const updatedProfile = { ...profile, status: 'submitted' };
      if (!updatedProfile.personalDetails?.firstName) {
        updatedProfile.personalDetails = {
          ...emptyProfile().personalDetails,
          firstName: 'Demo',
          lastName: 'Faculty',
          department: 'Computer Science',
          designation: 'Professor',
          officialEmail: 'demo@college.edu.in'
        };

        updatedProfile.facultyId = 'FAC-DEMO-1234';
      }
      setProfile(updatedProfile);
      lastSavedProfileRef.current = JSON.parse(JSON.stringify(updatedProfile));
    }
    setView('dashboard');
    notify('Instant demo dashboard loaded.');
  };

  const handleDemoAdmin = () => {
    localStorage.setItem('faculty360:admin-email', 'admin@college.edu.in');
    setRole('admin');
    setIsAuthenticated(true);
    setView('admin');
    notify('Demo administration workspace loaded.');
  };

  const handleDemoRegister = () => {
    setIsAuthenticated(true);
    const newProfile = {
      ...emptyProfile(),
      status: 'draft',
      facultyId: `FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      personalDetails: {
        ...emptyProfile().personalDetails,
        firstName: 'New',
        lastName: 'Faculty',
        officialEmail: 'new.faculty@college.edu.in'
      }
    };
    setProfile(newProfile);
    lastSavedProfileRef.current = JSON.parse(JSON.stringify(newProfile));
    setTab(0);
    setView('form');
    notify('Demo account created! Let\'s start by completing your profile details.');
  };

  const handleLogout = () => {
    withUnsavedCheck(() => {
      setConfirm({
        title: 'Sign out of Faculty Dashboard?',
        message: 'Are you sure you want to log out of your session?',
        confirmLabel: 'Sign Out',
        onConfirm: () => {
          setIsAuthenticated(false);
          setView('auth');
          notify('Logged out successfully.');
        }
      });
    });
  };

  /* ------------------------------------------------------------- navigation */

  const goTo = (index) => {
    if (index === tab && view === 'form') return;
    withUnsavedCheck(() => {
      setErrors({});
      setTab(index);
      setView('form');
    });
  };

  const handleNavigate = (targetView) => {
    if (targetView === view) return;
    
    if (targetView === 'dashboard' && profile.status !== 'submitted') {
      notify('Your Dashboard will be created after you complete and submit your profile.', 'error');
      return;
    }

    withUnsavedCheck(() => {
      setErrors({});
      setView(targetView);
    });
  };

  const saveDraft = async (pToSave = profile) => {
    setSaveState('saving');
    localStorage.setItem(DRAFT_KEY, JSON.stringify(pToSave));
    lastSavedProfileRef.current = JSON.parse(JSON.stringify(pToSave));
    try {
      await api.saveProfile(facultyId, pToSave);
      setSaveState('saved');
      setSavedAt(new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }));
      notify('Profile details saved successfully! Information updated.');
    } catch {
      setSaveState('offline');
      notify('Profile details saved on this device. Information updated.');
    }
  };

  const goNext = async () => {
    const found = validateSection(tab, profile);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      notify('Some fields need attention before you continue.', 'error');
      const parts = Object.keys(found)[0].split('.');
      if (parts.length === 3) {
        const record = profile[parts[0]][Number(parts[1])];
        if (record) setOpenRows((prev) => ({ ...prev, [record.rowId]: true }));
      }
      return;
    }

    // Persist profile and update saved reference snapshot
    await saveDraft(profile);
    if (tab < SECTIONS.length - 1) setTab(tab + 1);
    else setView('review');
  };

  const askToSubmit = () => {
    setConfirm({
      title: 'Are you sure you want to submit your faculty profile?',
      message:
        'Your profile goes to the department and college administration for review. You can request changes afterwards, but sections stay locked while the review is open.',
      confirmLabel: 'Confirm submission',
      onConfirm: async () => {
        setSubmitting(true);
        try {
          const res = await api.submitProfile(facultyId);
          setProfile((prev) => ({ ...prev, status: 'submitted', referenceNo: res.referenceNo, submittedAt: res.submittedAt }));
          notify('Profile submitted.');
        } catch {
          setProfile((prev) => ({
            ...prev,
            status: 'submitted',
            referenceNo: `FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            submittedAt: new Date().toISOString()
          }));
          notify('Submitted locally. It will sync when the server is reachable.', 'error');
        } finally {
          setSubmitting(false);
          setView('submitted');
        }
      }
    });
  };

  const reopen = async () => {
    try { await api.reopenProfile(facultyId); } catch { /* offline is fine */ }
    setProfile((prev) => ({ ...prev, status: 'draft' }));
    setView('form');
    setTab(0);
    notify('Profile reopened for editing.');
  };

  /* --------------------------------------------------------------- downloads */

  const downloads = {
    onPickJson: () => { downloadJson(profile); notify('Profile downloaded as a JSON file.'); },
    onPickCsv: () => { downloadCsv(profile); notify('Profile downloaded as a spreadsheet.'); },
    onPickHtml: () => { downloadHtml(profile); notify('Profile downloaded as a web page.'); },
    onPickPdf: () => {
      const opened = printProfile(profile);
      if (!opened) notify('Allow pop-ups for this site to open the print view.', 'error');
    }
  };

  /* ------------------------------------------------------------------ render */

  if (loading) {
    return (
      <div className="app loading-screen">
        <div className="loading-card">
          <div className="loading-brand">
            <img src="/wit-logo.jpg" alt="WIT Logo" className="wit-logo-header" />
            <span />
            <img src="/faculty360-logo-cropped.png" alt="Faculty 360" />
          </div>
          <div className="loading-spinner" aria-hidden="true" />
          <strong>Loading your faculty profile</strong>
          <p>Your saved information is being restored. This will only take a moment.</p>
        </div>
      </div>
    );
  }

  const Section = SECTION_COMPONENTS[tab];
  const isLast = tab === SECTIONS.length - 1;

  if (!isAuthenticated || view === 'auth') {
    return (
      <div className="app">
        <AuthScreen
          onLogin={handleLogin}
          onRegister={handleRegister}
          onDemoAccount={handleDemoLogin}
          onDemoRegister={handleDemoRegister}
          onDemoAdmin={handleDemoAdmin}
        />
        {toast && <Toast message={toast.message} kind={toast.kind} />}
      </div>
    );
  }

  if (role === 'admin' && view === 'admin') {
    return <AdminDashboard adminEmail={localStorage.getItem('faculty360:admin-email') || 'admin@college.edu.in'} onLogout={() => { setIsAuthenticated(false); setRole('faculty'); setView('auth'); notify('Logged out successfully.'); }} notify={notify} />;
  }

  return (
    <div className="app">
      <AppHeader
        profile={profile}
        percent={percent}
        saveState={saveState}
        savedAt={savedAt}
        view={view}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <DownloadMenu {...downloads} />
      </AppHeader>

      {view === 'dashboard' ? (
        <Dashboard
          profile={profile}
          scores={scores}
          percent={percent}
          onNavigate={handleNavigate}
          onDownloadPdf={downloads.onPickPdf}
        />
      ) : (
        <main className="shell page">
          {view === 'form' && (
            <div className="profile-layout">
              <SideNav active={tab} scores={scores} onSelect={goTo} />
              <div className="profile-content">
                <div className="panel">
                  <Section ctx={ctx} />
                </div>
                
                <div className="actionbar">
                  <button type="button" className="btn btn-outline" onClick={saveDraft}>Save draft</button>
                  <button type="button" className="btn btn-plain" disabled={tab === 0} onClick={() => goTo(tab - 1)}>
                    Previous Section
                  </button>
                  <div className="actionbar-end">
                    <button type="button" className="btn btn-primary" onClick={goNext}>
                      {isLast ? 'Review Profile' : 'Save & Continue'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'review' && (
            <ReviewPanel
              profile={profile}
              scores={scores}
              submitting={submitting}
              onEdit={(index) => { setTab(index); setView('form'); }}
              onBack={() => setView('form')}
              onSaveDraft={saveDraft}
              onSubmit={askToSubmit}
            />
          )}

          {view === 'settings' && (
            <Settings />
          )}

          {view === 'submitted' && (
            <SubmittedPanel
              profile={profile}
              onReopen={reopen}
              onReview={() => setView('review')}
              onDownload={downloads.onPickPdf}
              onGoDashboard={() => setView('dashboard')}
            />
          )}
        </main>
      )}

      <AppFooter />

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          onCancel={() => setConfirm(null)}
          onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
        />
      )}

      {unsavedPrompt && (
        <UnsavedChangesModal
          sectionName={unsavedPrompt.sectionName}
          onSave={unsavedPrompt.onSave}
          onDiscard={unsavedPrompt.onDiscard}
          onCancel={() => setUnsavedPrompt(null)}
        />
      )}

      {toast && <Toast message={toast.message} kind={toast.kind} />}
    </div>
  );
}
