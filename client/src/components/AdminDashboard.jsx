import React, { useEffect, useMemo, useState } from 'react';
import { CheckIcon, DocumentIcon, EyeIcon, SearchIcon } from './Icons';
import { AppFooter, AppHeader } from './Chrome';
import * as api from '../api/facultyApi';
import { DEPARTMENTS, DESIGNATIONS, GENDERS, BLOOD_GROUPS, HIGHEST_QUALIFICATIONS, PHD_STATUSES, PUBLICATION_TYPES, PATENT_STATUSES, AWARD_CATEGORIES, AWARD_LEVELS, PROJECT_TYPES, PROJECT_STATUSES } from '../data/constants';

const statusLabels = { draft: 'Draft', submitted: 'Submitted', approved: 'Approved', returned: 'Returned' };

export function AdminDashboard({ onLogout, notify, adminEmail }) {
  const [profiles, setProfiles] = useState([]);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ department: '', designation: '', gender: '', bloodGroup: '', highestQualification: '', phdStatus: '', publicationType: '', patentStatus: '', awardCategory: '', awardLevel: '', projectType: '', projectStatus: '', minCompletion: '', maxCompletion: '' });

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const result = await api.listProfiles({ status, ...filters }, adminEmail);
      setProfiles(result.profiles || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfiles(); }, [status, filters.department, filters.designation, filters.gender, filters.bloodGroup, filters.highestQualification, filters.phdStatus, filters.publicationType, filters.patentStatus, filters.awardCategory, filters.awardLevel, filters.projectType, filters.projectStatus, filters.minCompletion, filters.maxCompletion]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return profiles;
    return profiles.filter((profile) => {
      const p = profile.personalDetails || {};
      return [profile.facultyId, p.firstName, p.lastName, p.department, p.designation, p.officialEmail]
        .filter(Boolean).join(' ').toLowerCase().includes(needle);
    });
  }, [profiles, query]);

  const metrics = useMemo(() => ({
    total: profiles.length,
    submitted: profiles.filter((p) => p.status === 'submitted').length,
    approved: profiles.filter((p) => p.status === 'approved').length,
    needsAttention: profiles.filter((p) => p.status === 'returned' || p.status === 'draft').length
  }), [profiles]);

  const openProfile = async (facultyId) => {
    try {
      const result = await api.getAdminProfile(facultyId, adminEmail);
      setSelected(result.profile);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (action) => {
    if (!selected) return;
    try {
      const result = action === 'approve'
        ? await api.approveProfile(selected.facultyId)
        : await api.returnProfile(selected.facultyId);
      setSelected(result.profile);
      await loadProfiles();
      notify(action === 'approve' ? 'Profile approved.' : 'Profile returned for updates.');
    } catch (err) {
      setError(err.message);
    }
  };

  const nameOf = (profile) => {
    const p = profile.personalDetails || {};
    return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || 'Unnamed faculty';
  };

  const setFilter = (key, value) => setFilters((previous) => ({ ...previous, [key]: value }));
  const exportDirectory = (format) => {
    const headers = ['Faculty ID', 'Name', 'Department', 'Designation', 'Email', 'Status', 'Completion', 'Updated'];
    const rows = filtered.map((profile) => {
      const p = profile.personalDetails || {};
      return [profile.facultyId, nameOf(profile), p.department, p.designation, p.officialEmail, profile.status, `${profile.completion || 0}%`, profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('en-IN') : ''];
    });
    const esc = (value) => `"${String(value || '').replace(/"/g, '""')}"`;
    if (format === 'excel') {
      const blob = new Blob([`\uFEFF${[headers, ...rows].map((row) => row.map(esc).join(',')).join('\n')}`], { type: 'application/vnd.ms-excel;charset=utf-8' });
      downloadBlob(blob, 'faculty-directory.xls');
    } else {
      const table = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell || '—'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      const html = `<html><head><title>Faculty directory</title><style>body{font-family:Arial;padding:30px;color:#173042}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccd8dd;padding:8px;text-align:left}th{background:#e9f1f5}</style></head><body><h1>Faculty 360 — Faculty directory</h1>${table}</body></html>`;
      if (format === 'word') downloadBlob(new Blob([html], { type: 'application/msword' }), 'faculty-directory.doc');
      else { const win = window.open('', '_blank'); if (!win) { notify('Allow pop-ups to print the directory.', 'error'); return; } win.document.write(html); win.document.close(); win.focus(); win.print(); }
    }
  };

  return (
    <div className="admin-shell">
      <AppHeader
        variant="admin"
        profile={{ personalDetails: {} }}
        view="admin"
        onNavigate={() => {}}
        onLogout={onLogout}
      />
      <main className="admin-content">
        <div className="admin-heading"><div><p className="admin-eyebrow">COLLEGE ADMINISTRATION</p><h1>Faculty directory</h1><p>Review profile completion, submissions, and faculty records from one workspace.</p></div><button className="btn btn-outline" onClick={loadProfiles}>Refresh data</button></div>
        {error && <div className="admin-error">{error}</div>}
        <section className="admin-metrics">
          <Metric label="Total faculty" value={metrics.total} />
          <Metric label="Awaiting review" value={metrics.submitted} tone="blue" />
          <Metric label="Approved" value={metrics.approved} tone="green" />
          <Metric label="Needs attention" value={metrics.needsAttention} tone="orange" />
        </section>
        <section className="admin-panel">
          <div className="admin-toolbar"><div className="admin-search"><SearchIcon size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, ID, department or email" /></div><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><button className="btn btn-outline" onClick={() => exportDirectory('excel')}>Excel</button><button className="btn btn-outline" onClick={() => exportDirectory('word')}>Word</button><button className="btn btn-primary" onClick={() => exportDirectory('pdf')}>PDF</button></div>
          <div className="admin-filters">
            <Filter label="Department" value={filters.department} options={DEPARTMENTS} onChange={(value) => setFilter('department', value)} />
            <Filter label="Designation" value={filters.designation} options={DESIGNATIONS} onChange={(value) => setFilter('designation', value)} />
            <Filter label="Gender" value={filters.gender} options={GENDERS} onChange={(value) => setFilter('gender', value)} />
            <Filter label="Blood group" value={filters.bloodGroup} options={BLOOD_GROUPS} onChange={(value) => setFilter('bloodGroup', value)} />
            <Filter label="Highest qualification" value={filters.highestQualification} options={HIGHEST_QUALIFICATIONS} onChange={(value) => setFilter('highestQualification', value)} />
            <Filter label="Ph.D. status" value={filters.phdStatus} options={PHD_STATUSES} onChange={(value) => setFilter('phdStatus', value)} />
            <Filter label="Publication type" value={filters.publicationType} options={PUBLICATION_TYPES} onChange={(value) => setFilter('publicationType', value)} />
            <Filter label="Patent status" value={filters.patentStatus} options={PATENT_STATUSES} onChange={(value) => setFilter('patentStatus', value)} />
            <Filter label="Award category" value={filters.awardCategory} options={AWARD_CATEGORIES} onChange={(value) => setFilter('awardCategory', value)} />
            <Filter label="Award level" value={filters.awardLevel} options={AWARD_LEVELS} onChange={(value) => setFilter('awardLevel', value)} />
            <Filter label="Project type" value={filters.projectType} options={PROJECT_TYPES} onChange={(value) => setFilter('projectType', value)} />
            <Filter label="Project status" value={filters.projectStatus} options={PROJECT_STATUSES} onChange={(value) => setFilter('projectStatus', value)} />
            <Filter label="Minimum completion" value={filters.minCompletion} options={['0', '25', '50', '75', '100']} onChange={(value) => setFilter('minCompletion', value)} />
            <Filter label="Maximum completion" value={filters.maxCompletion} options={['25', '50', '75', '100']} onChange={(value) => setFilter('maxCompletion', value)} />
          </div>
          {loading ? <div className="admin-empty">Loading faculty records...</div> : filtered.length === 0 ? <div className="admin-empty">No faculty records match these filters.</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Faculty</th><th>Department</th><th>Completion</th><th>Status</th><th>Last updated</th><th /></tr></thead><tbody>{filtered.map((profile) => <tr key={profile.facultyId}><td><strong>{nameOf(profile)}</strong><small>{profile.facultyId}</small></td><td>{profile.personalDetails?.department || '—'}<small>{profile.personalDetails?.designation || ''}</small></td><td><div className="admin-progress"><span style={{ width: `${profile.completion || 0}%` }} /></div><small>{profile.completion || 0}% complete</small></td><td><span className={`admin-status ${profile.status}`}>{statusLabels[profile.status] || profile.status}</span></td><td>{profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('en-IN') : '—'}</td><td><button className="admin-view-btn" onClick={() => openProfile(profile.facultyId)}><EyeIcon size={15} /> View</button></td></tr>)}</tbody></table></div>}
        </section>
      </main>
      {selected && <ProfileDrawer profile={selected} name={nameOf(selected)} onClose={() => setSelected(null)} onAction={updateStatus} />}
      <AppFooter />
    </div>
  );
}

function Metric({ label, value, tone = '' }) {
  return <div className={`admin-metric ${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function Filter({ label, value, options, onChange }) {
  return <label className="admin-filter"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}><option value="">All</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function ProfileDrawer({ profile, name, onClose, onAction }) {
  const p = profile.personalDetails || {};
  const count = (key) => profile[key]?.length || 0;
  return <div className="admin-drawer-backdrop" onClick={onClose}><aside className="admin-drawer" onClick={(e) => e.stopPropagation()}><div className="admin-drawer-head"><div><p className="admin-eyebrow">FACULTY PROFILE</p><h2>{name}</h2><span>{profile.facultyId}</span></div><button className="admin-close" onClick={onClose}>×</button></div><div className="admin-drawer-status"><span className={`admin-status ${profile.status}`}>{statusLabels[profile.status]}</span><strong>{profile.completion || 0}% complete</strong></div><div className="admin-detail-grid"><Detail label="Department" value={p.department} /><Detail label="Designation" value={p.designation} /><Detail label="Official email" value={p.officialEmail || profile.contactDetails?.email} /><Detail label="Mobile" value={profile.contactDetails?.mobile} /></div><h3>Profile activity</h3><div className="admin-record-counts"><Detail label="Publications" value={count('publications')} /><Detail label="Projects" value={count('projects')} /><Detail label="Patents" value={count('patents')} /><Detail label="Awards" value={count('awards')} /><Detail label="Courses" value={count('nptelCourses') + count('otherCourses')} /><Detail label="Programs" value={count('programs')} /></div><div className="admin-drawer-actions"><a className="btn btn-outline" href={`/api/faculty/${profile.facultyId}/export/html`} target="_blank" rel="noreferrer"><DocumentIcon size={15} /> Open report</a>{profile.status === 'submitted' && <><button className="btn btn-primary" onClick={() => onAction('approve')}><CheckIcon size={15} /> Approve</button><button className="btn btn-danger" onClick={() => onAction('return')}>Return for updates</button></>}</div></aside></div>;
}

function Detail({ label, value }) { return <div className="admin-detail"><span>{label}</span><strong>{value || '—'}</strong></div>; }
