import React, { useState } from 'react';
import { SECTIONS } from '../data/constants';
import {
  EditIcon, DocumentIcon, LogoutIcon, EyeIcon, BookIcon, PatentIcon,
  AcademicCapIcon, AwardIcon, BriefcaseIcon, CheckIcon, ArrowRightIcon, MailIcon,
  DownloadIcon, LinkExternalIcon
} from './Icons';

export function Dashboard({ profile, scores, percent, onNavigate, onDownloadPdf, onLogout }) {
  const p = profile?.personalDetails || {};
  const fullName = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || 'Faculty Member';

  const pubCount = profile?.publications?.length || 0;
  const patentCount = profile?.patents?.length || 0;
  const programCount = profile?.programs?.length || 0;
  const awardCount = profile?.awards?.length || 0;
  const projectCount = profile?.projects?.length || 0;
  const certCount = (profile?.nptelCourses?.length || 0) + (profile?.otherCourses?.length || 0);

  const completedSectionsCount = scores.filter((s) => s === 100).length;

  const [activeProofCategory, setActiveProofCategory] = useState(null);

  return (
    <>
      <div className="ig-dashboard-wrapper">
      {/* Main Content Area */}
      <main className="ig-main-content">
        <header className="ig-header">
          <div>
            <h1 className="ig-greeting">Welcome, {p.firstName || 'Faculty'}</h1>
            <p className="ig-sub-greeting">Here is your academic profile overview.</p>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="ig-stats-section">
          <h2 className="ig-section-title">Achievements</h2>
          <div className="ig-stats-grid">
            <div className="ig-stat-card clickable-stat" onClick={() => setActiveProofCategory('publications')}>
              <div className="ig-stat-icon"><BookIcon size={22} /></div>
              <div className="ig-stat-info">
                <span className="ig-stat-val">{pubCount}</span>
                <span className="ig-stat-label">Publications</span>
              </div>
            </div>
            <div className="ig-stat-card clickable-stat" onClick={() => setActiveProofCategory('patents')}>
              <div className="ig-stat-icon"><PatentIcon size={22} /></div>
              <div className="ig-stat-info">
                <span className="ig-stat-val">{patentCount}</span>
                <span className="ig-stat-label">Patents</span>
              </div>
            </div>
            <div className="ig-stat-card clickable-stat" onClick={() => setActiveProofCategory('programs')}>
              <div className="ig-stat-icon"><AcademicCapIcon size={22} /></div>
              <div className="ig-stat-info">
                <span className="ig-stat-val">{programCount}</span>
                <span className="ig-stat-label">FDPs/Workshops</span>
              </div>
            </div>
            <div className="ig-stat-card clickable-stat" onClick={() => setActiveProofCategory('awards')}>
              <div className="ig-stat-icon"><AwardIcon size={22} /></div>
              <div className="ig-stat-info">
                <span className="ig-stat-val">{awardCount}</span>
                <span className="ig-stat-label">Awards</span>
              </div>
            </div>
            <div className="ig-stat-card clickable-stat" onClick={() => setActiveProofCategory('projects')}>
              <div className="ig-stat-icon"><BriefcaseIcon size={22} /></div>
              <div className="ig-stat-info">
                <span className="ig-stat-val">{projectCount}</span>
                <span className="ig-stat-label">Projects</span>
              </div>
            </div>
            <div className="ig-stat-card clickable-stat" onClick={() => setActiveProofCategory('certifications')}>
              <div className="ig-stat-icon"><DocumentIcon size={22} /></div>
              <div className="ig-stat-info">
                <span className="ig-stat-val">{certCount}</span>
                <span className="ig-stat-label">Certifications</span>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Progress */}
        <section className="ig-sections-feed">
          <h2 className="ig-section-title">Profile Progress</h2>
          <div className="progress-summary-grid">
            {SECTIONS.map((s, i) => (
              <div key={s.key} className="progress-summary-item">
                <div className="ps-left">
                  <span className="ps-num">{String(s.number).padStart(2, '0')}</span>
                  <span className="ps-name">{s.name}</span>
                </div>
                <span className={`ps-status ${scores[i] === 100 ? 'complete' : scores[i] > 0 ? 'partial' : 'empty'}`}>
                  {scores[i] === 100 ? '100% Done' : scores[i] > 0 ? `${scores[i]}% Done` : 'Not Started'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Right Sidebar (Solid, fixed, non-scrollable) */}
      <aside className="ig-right-sidebar">
        <div className="ig-sidebar-inner">
          <div className="ig-profile-block">
            <div className="ig-avatar-container">
              {p.photoUrl ? (
                <img className="ig-avatar" src={p.photoUrl} alt={fullName} />
              ) : (
                <div className="ig-avatar-placeholder">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h2 className="ig-profile-name">{fullName}</h2>
            <p className="ig-profile-role">{p.designation || 'Faculty Member'}</p>
            <p className="ig-profile-dept">{p.department || 'Department'}</p>
            
            <div className={`ig-status-badge ${profile?.status === 'submitted' ? 'submitted' : 'draft'}`}>
              {profile?.status === 'submitted' ? (
                <><CheckIcon size={14} /> Profile Submitted</>
              ) : (
                <><EditIcon size={14} /> Draft Profile</>
              )}
            </div>
          </div>

          <div className="ig-completion-block">
            <div className="ig-comp-header">
              <span>Completion</span>
              <strong>{percent}%</strong>
            </div>
            <div className="ig-comp-bar-bg">
              <div className="ig-comp-bar-fill" style={{ width: `${percent}%` }} />
            </div>
            <p className="ig-comp-text">{completedSectionsCount} of {SECTIONS.length} sections finished</p>
          </div>

          <div className="ig-actions-block">
            <button className="ig-btn ig-btn-primary" onClick={() => onNavigate('form')}>
              <EditIcon size={16} /> Profile Workspace
            </button>
            <button className="ig-btn ig-btn-secondary" onClick={onDownloadPdf}>
              <DocumentIcon size={16} /> Download PDF
            </button>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
            <div className="ig-divider"></div>
            <button 
              className="ig-btn ig-btn-danger" 
              onClick={() => {
                if (window.confirm('Are you sure you want to log out of your dashboard?')) {
                  onLogout();
                }
              }}
            >
              <LogoutIcon size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>
    </div>
    {activeProofCategory && (
      <ProofsViewerModal 
        category={activeProofCategory} 
        profile={profile} 
        onClose={() => setActiveProofCategory(null)} 
      />
    )}
    </>
  );
}

function ProofsViewerModal({ category, profile, onClose }) {
  const getRecords = () => {
    switch (category) {
      case 'publications':
        return (profile.publications || []).map(p => ({
          title: p.title || 'Untitled Publication',
          details: [
            p.type && `Type: ${p.type}`,
            p.source && `Published in: ${p.source}`,
            p.publisher && `Publisher: ${p.publisher}`,
            p.issn && `ISSN/ISBN: ${p.issn}`,
            (p.month || p.year) && `Date: ${[p.month, p.year].filter(Boolean).join(' ')}`,
            p.authors?.filter(Boolean).length > 0 && `Authors: ${p.authors.filter(Boolean).join(', ')}`
          ].filter(Boolean),
          link: p.link,
          proofObj: null
        }));
      case 'patents':
        return (profile.patents || []).map(p => ({
          title: p.title || 'Untitled Patent',
          details: [
            p.appNo && `Patent Application Number: ${p.appNo}`,
            p.status && `Status: ${p.status}`,
            p.inventors?.filter(Boolean).length > 0 && `Inventor/s: ${p.inventors.filter(Boolean).join(', ')}`,
            p.applicants?.filter(Boolean).length > 0 && `Applicants: ${p.applicants.filter(Boolean).join(', ')}`,
            p.filedDate && `Filed: ${formatDate(p.filedDate)}`,
            p.grantNo && `Grant No: ${p.grantNo}`,
            p.grantDate && `Grant Date: ${formatDate(p.grantDate)}`
          ].filter(Boolean),
          proofObj: p.proof
        }));
      case 'programs':
        return (profile.programs || []).map(p => ({
          title: p.title || 'Untitled Programme',
          details: [
            p.participation && `Participation: ${p.participation}`,
            p.types?.length > 0 && `Type: ${p.types.join(', ')}`,
            p.organizer && `Organizer: ${p.organizer}`,
            p.awardingAgency && `Awarding Agency: ${p.awardingAgency}`,
            p.capacity && `Capacity: ${p.capacity}`,
            p.mode && `Mode: ${p.mode}`,
            (p.from || p.to) && `Period: ${[formatDate(p.from), formatDate(p.to)].filter(Boolean).join(' – ')}`
          ].filter(Boolean),
          link: p.proofUrl,
          proofObj: null
        }));
      case 'awards':
        return (profile.awards || []).map(p => ({
          title: p.title || 'Untitled Award',
          details: [
            p.agency && `Awarding Agency: ${p.agency}`,
            p.category && `Category: ${p.category}`,
            p.level && `Level: ${p.level}`,
            p.date && `Date: ${formatDate(p.date)}`
          ].filter(Boolean),
          proofObj: p.proof
        }));
      case 'projects':
        return (profile.projects || []).map(p => ({
          title: p.title || 'Untitled Project',
          details: [
            p.type && `Type: ${p.type}`,
            p.principalInvestigator && `Principal Investigator: ${p.principalInvestigator}`,
            p.agency && `Funding Agency: ${p.agency}`,
            p.status && `Status: ${p.status}`,
            p.sanctioned && `Sanctioned: ₹${Number(p.sanctioned).toLocaleString('en-IN')}`,
            (p.from || p.to) && `Period: ${[formatDate(p.from), formatDate(p.to)].filter(Boolean).join(' – ')}`
          ].filter(Boolean),
          proofObj: p.proof
        }));
      case 'certifications': {
        const nptel = (profile.nptelCourses || []).map(p => ({
          title: p.title || 'Untitled NPTEL Course',
          details: [
            'Platform: NPTEL',
            p.result && `Result: ${p.result}`,
            p.durationWeeks && `Duration: ${p.durationWeeks} weeks`,
            (p.from || p.to) && `Period: ${[formatDate(p.from), formatDate(p.to)].filter(Boolean).join(' – ')}`
          ].filter(Boolean),
          proofObj: p.certificate
        }));
        const other = (profile.otherCourses || []).map(p => ({
          title: p.title || 'Untitled Course',
          details: [
            p.platform && `Platform: ${p.platform}`,
            p.award && `Award/Grade: ${p.award}`,
            (p.from || p.to) && `Period: ${[formatDate(p.from), formatDate(p.to)].filter(Boolean).join(' – ')}`
          ].filter(Boolean),
          proofObj: p.certificate
        }));
        return [...nptel, ...other];
      }
      default:
        return [];
    }
  };

  const records = getRecords();

  const resolveProof = (record) => {
    if (record.link) return { type: 'link', url: record.link };
    if (record.proofObj) {
      if (record.proofObj.mode === 'link' && record.proofObj.url) return { type: 'link', url: record.proofObj.url };
      if (record.proofObj.mode === 'file' && record.proofObj.filePath) {
        const url = record.proofObj.filePath.startsWith('data:') ? record.proofObj.filePath : `http://localhost:3001${record.proofObj.filePath}`;
        return { type: 'file', url, fileName: record.proofObj.fileName || 'download' };
      }
    }
    return null;
  };

  const catNames = {
    publications: 'Publications',
    patents: 'Patents',
    programs: 'FDPs & Workshops',
    awards: 'Achievements and Awards',
    projects: 'Projects and Consultancy',
    certifications: 'Courses and Certifications'
  };

  const catIcons = {
    publications: <BookIcon size={20} />,
    patents: <PatentIcon size={20} />,
    programs: <AcademicCapIcon size={20} />,
    awards: <AwardIcon size={20} />,
    projects: <BriefcaseIcon size={20} />,
    certifications: <DocumentIcon size={20} />
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="proof-viewer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="proof-viewer-header">
          <div className="proof-viewer-title-row">
            <span className="proof-viewer-icon">{catIcons[category]}</span>
            <h2 className="proof-viewer-title">{catNames[category]}</h2>
            <span className="proof-viewer-count">{records.length}</span>
          </div>
          <button className="proof-viewer-close" onClick={onClose} title="Close">✕</button>
        </div>

        {/* Body */}
        <div className="proof-viewer-body">
          {records.length === 0 ? (
            <div className="proof-viewer-empty">
              <span className="proof-viewer-empty-icon">{catIcons[category]}</span>
              <p>No {catNames[category]?.toLowerCase()} records have been added yet.</p>
            </div>
          ) : (
            <div className="proof-tiles-grid">
              {records.map((rec, i) => {
                const proof = resolveProof(rec);
                return (
                  <div key={i} className="proof-tile">
                    <div className="proof-tile-header">
                      <h3 className="proof-tile-title">{rec.title}</h3>
                      {proof ? (
                        proof.type === 'file' ? (
                          <a
                            href={proof.url}
                            download={proof.fileName}
                            className="proof-tile-action proof-tile-download"
                            title="Download proof"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DownloadIcon size={16} color="#fff" />
                          </a>
                        ) : (
                          <a
                            href={proof.url}
                            target="_blank"
                            rel="noreferrer"
                            className="proof-tile-action proof-tile-link"
                            title="Open proof link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <LinkExternalIcon size={16} color="#0095f6" />
                          </a>
                        )
                      ) : (
                        <span className="proof-tile-no-proof" title="No proof uploaded">—</span>
                      )}
                    </div>
                    <ul className="proof-tile-details">
                      {rec.details.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                    <div className="proof-tile-footer">
                      {proof ? (
                        <span className="proof-tile-badge proof-available">
                          <CheckIcon size={12} /> Proof Available
                        </span>
                      ) : (
                        <span className="proof-tile-badge proof-missing">
                          No Proof
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return '';
  const x = new Date(d);
  if (isNaN(x)) return d;
  return x.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
