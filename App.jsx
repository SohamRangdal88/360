import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { AppHeader, TabRail, DownloadMenu, ConfirmModal, Toast } from './components/Chrome';
import { ReviewPanel, SubmittedPanel } from './components/ReviewPanel';
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

const FACULTY_ID = 'FAC-2011-0342'; // supplied by the login layer in production
const DRAFT_KEY = `faculty360:${FACULTY_ID}`;

const SECTION_COMPONENTS = [
  PersonalSection, ContactSection, QualificationSection, ProfessionalSection,
  IndustryTrainingSection, ProgramSection, PublicationSection, PatentSection,
  AwardSection, FinancialSupportSection, ProjectSection, CourseSection
];

export default function App() {
  const [profile, setProfile] = useState(() => ({ ...emptyProfile(), facultyId: FACULTY_ID }));
  const [tab, setTab] = useState(0);
  const [errors, setErrors] = useState({});
  const [openRows, setOpenRows] = useState({});
  const [view, setView] = useState('form'); // form | review | submitted
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saveState, setSaveState] = useState('saved');
  const [savedAt, setSavedAt] = useState('');
  const [uploading, setUploading] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const firstRender = useRef(true);

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
      try {
        const { profile: fromServer } = await api.getProfile(FACULTY_ID);
        if (!cancelled) {
          setProfile(withRowIds({ ...emptyProfile(), ...fromServer, facultyId: FACULTY_ID }));
          if (fromServer.status === 'submitted') setView('submitted');
          setSaveState('saved');
          setSavedAt('on the server');
        }
      } catch {
        // no API reachable: fall back to the copy kept in this browser
        const local = localStorage.getItem(DRAFT_KEY);
        if (!cancelled && local) {
          try {
            setProfile(withRowIds({ ...emptyProfile(), ...JSON.parse(local) }));
          } catch {
            /* ignore a corrupt draft */
          }
        }
        if (!cancelled) {
          setSaveState('offline');
          notify('Working offline. Your draft is being kept in this browser.', 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [notify]);

  /* --------------------------------------------------------- autosave draft */

  useEffect(() => {
    if (firstRender.current || loading) {
      firstRender.current = false;
      return undefined;
    }
    if (view === 'submitted') return undefined;

    setSaveState('saving');
    const timer = setTimeout(async () => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(profile));
      try {
        await api.saveProfile(FACULTY_ID, profile);
        setSaveState('saved');
        setSavedAt(new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }));
      } catch {
        setSaveState('offline');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [profile, loading, view]);

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

  /* ------------------------------------------------------------- navigation */

  const goTo = (index) => {
    setErrors({});
    setTab(index);
    setView('form');
  };

  const saveDraft = async () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(profile));
    try {
      await api.saveProfile(FACULTY_ID, profile);
      setSaveState('saved');
      setSavedAt(new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }));
      notify('Draft saved.');
    } catch {
      setSaveState('offline');
      notify('Draft saved in this browser. The server could not be reached.', 'error');
    }
  };

  const goNext = () => {
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

    notify(`${SECTIONS[tab].name} saved.`);
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
          const res = await api.submitProfile(FACULTY_ID);
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
    try { await api.reopenProfile(FACULTY_ID); } catch { /* offline is fine */ }
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
      <div className="app">
        <div className="shell page">
          <div className="panel">Loading your profile.</div>
        </div>
      </div>
    );
  }

  const Section = SECTION_COMPONENTS[tab];
  const isLast = tab === SECTIONS.length - 1;

  return (
    <div className="app">
      <AppHeader profile={profile} percent={percent} saveState={saveState} savedAt={savedAt}>
        <DownloadMenu {...downloads} />
      </AppHeader>

      {view === 'form' && <TabRail active={tab} scores={scores} onSelect={goTo} />}

      <main className="shell page">
        {view === 'form' && (
          <div className="column">
            <div className="panel">
              <Section ctx={ctx} />
            </div>

            <div className="actionbar">
              <button type="button" className="btn btn-outline" onClick={saveDraft}>Save draft</button>
              <button type="button" className="btn btn-plain" disabled={tab === 0} onClick={() => goTo(tab - 1)}>
                Previous
              </button>
              <div className="actionbar-end">
                <button type="button" className="btn btn-primary" onClick={goNext}>
                  {isLast ? 'Review and submit' : 'Save and continue'}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'review' && (
          <ReviewPanel
            profile={profile}
            scores={scores}
            submitting={submitting}
            onEdit={goTo}
            onBack={() => { setView('form'); setTab(SECTIONS.length - 1); }}
            onSaveDraft={saveDraft}
            onSubmit={askToSubmit}
          />
        )}

        {view === 'submitted' && (
          <SubmittedPanel
            profile={profile}
            onReopen={reopen}
            onReview={() => setView('review')}
            onDownload={downloads.onPickPdf}
          />
        )}
      </main>

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

      {toast && <Toast message={toast.message} kind={toast.kind} />}
    </div>
  );
}
