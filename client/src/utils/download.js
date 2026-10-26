/* Builds the downloads from whatever is on screen right now, so a faculty
   member can take a copy before the draft has ever reached the server.
   The same three formats are also served by the API for the admin side. */

import html2pdf from 'html2pdf.js';
import { formatDate, formatRupees } from './helpers';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function fileStem(profile) {
  const p = profile.personalDetails;
  const name = [p.firstName, p.lastName].filter(Boolean).join('_') || 'faculty';
  return `${name.replace(/[^A-Za-z0-9_]/g, '')}_faculty360_${new Date().toISOString().slice(0, 10)}`;
}

/* strip UI only keys before exporting */
function clean(profile) {
  const copy = JSON.parse(JSON.stringify(profile));
  Object.keys(copy).forEach((k) => {
    if (Array.isArray(copy[k])) {
      copy[k] = copy[k].map((r) => {
        if (r && typeof r === 'object') {
          const { rowId, ...rest } = r;
          return rest;
        }
        return r;
      });
    }
  });
  return copy;
}

/* ------------------------------------------------------------------ JSON */

export function downloadJson(profile) {
  const payload = {
    exportedAt: new Date().toISOString(),
    generatedBy: 'Faculty 360',
    profile: clean(profile)
  };
  triggerDownload(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    `${fileStem(profile)}.json`
  );
}

/* ------------------------------------------------------------------- CSV */

const csvCell = (v) => {
  const s = String(v ?? '').replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
};

export function downloadCsv(profile) {
  const rows = [['Section', 'Record', 'Field', 'Value']];
  const push = (section, index, obj) => {
    Object.entries(obj).forEach(([field, value]) => {
      if (value === '' || value === null || value === undefined) return;
      if (field === 'rowId' || field === '_id') return;
      const printable = Array.isArray(value)
        ? value.join(' | ')
        : typeof value === 'object'
          ? Object.entries(value).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' | ')
          : value;
      if (printable !== '') rows.push([section, index, field, printable]);
    });
  };

  const q = profile.qualifications;
  push('Personal details', 1, profile.personalDetails);
  push('Contact details', 1, profile.contactDetails);
  push('Qualifications', 1, {
    highest: q.highest,
    ...Object.fromEntries(Object.entries(q.ug).map(([k, v]) => [`ug_${k}`, v])),
    ...Object.fromEntries(Object.entries(q.pg).map(([k, v]) => [`pg_${k}`, v])),
    ...Object.fromEntries(Object.entries(q.phd).map(([k, v]) => [`phd_${k}`, v]))
  });
  push('Professional details', 1, profile.professionalDetails);

  const lists = {
    'Industry trainings': profile.industryTrainings,
    'FDP STTP Workshop': profile.programs,
    Publications: profile.publications,
    Patents: profile.patents,
    Awards: profile.awards,
    'Financial support': profile.financialSupport,
    Projects: profile.projects,
    'NPTEL courses': profile.nptelCourses,
    'Other courses': profile.otherCourses
  };
  Object.entries(lists).forEach(([label, list]) => {
    (list || []).forEach((r, i) => push(label, i + 1, r));
  });

  const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');
  triggerDownload(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }), `${fileStem(profile)}.csv`);
}

/* ------------------------------------------------------- printable sheet */

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const dash = (v) => (String(v ?? '').trim() === '' ? '—' : esc(v));

const proofText = (p = {}) => (p.mode === 'file' ? p.fileName || 'Uploaded file' : p.url || '');

function table(pairs) {
  return `<div class="grid-2">${pairs
    .map(([k, v]) => {
      const val = dash(v);
      if (val === '—') return '';
      return `<div><strong>${esc(k)}:</strong> ${val}</div>`;
    })
    .join('')}</div>`;
}

function cardList(list, build, emptyText) {
  if (!list || !list.length) return `<p class="none">${esc(emptyText)}</p>`;
  return list
    .map((r, i) => {
      const { heading, pairs } = build(r);
      const validPairs = pairs.filter(([, v]) => dash(v) !== '—');
      return `<div class="cv-entry">
        <div class="item-title">${i + 1}. ${dash(heading)}</div>
        <ul style="margin-top: 4px; font-size: 12px; color: #444;">
          ${validPairs.map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${dash(v)}</li>`).join('')}
        </ul>
      </div>`;
    })
    .join('');
}

export function buildProfileHtml(profile) {
  const p = profile.personalDetails;
  const c = profile.contactDetails;
  const q = profile.qualifications;
  const pr = profile.professionalDetails;
  const name = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || 'Faculty profile';

  const section = (title, inner) => `<section><h2>${esc(title)}</h2>${inner}</section>`;
  const tags = (arr) =>
    arr && arr.length ? `<p class="tags">${arr.map((t) => `<span>${esc(t)}</span>`).join('')}</p>` : '<p class="none">—</p>';

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(name)} — Curriculum Vitae</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
       font-size:14px;line-height:1.4;color:#1b1b1b;margin:0;padding:15px 25px;background:#fff}
  header{display:flex;align-items:center;border-bottom:2px solid #12455f;padding-bottom:12px;margin-bottom:16px;gap:20px}
  .faculty-photo{width:110px;height:120px;object-fit:cover;border-radius:4px;border:1px solid #12455f}
  .wit-logo-square{height:100px;width:auto;max-width:160px;object-fit:contain;mix-blend-mode:multiply}
  .header-info{flex:1;text-align:center}
  header h1{font-size:24px;margin:0 0 4px;color:#12455f;text-transform:uppercase;letter-spacing:0.5px}
  header h3{font-size:14px;margin:0 0 6px;color:#555;font-weight:600}
  header p{margin:0;color:#55636b;font-size:12px}
  section{margin-bottom:18px;page-break-inside:avoid}
  section h2{font-size:15px;color:#12455f;margin:0 0 8px;padding-bottom:4px;border-bottom:1px solid #d8dee2;text-transform:uppercase;letter-spacing:0.5px}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;margin-bottom:6px;font-size:13.5px}
  .cv-entry{margin-bottom:10px}
  .item-title{font-weight:600;color:#222;font-size:13.5px}
  .none{color:#79868d;font-style:italic;margin:0 0 6px}
  .tags span{display:inline-block;background:#f4f6f8;border:1px solid #cfd8dc;border-radius:3px;padding:2px 7px;margin:0 5px 5px 0;font-size:11.5px}
  footer{margin-top:20px;padding-top:10px;border-top:1px solid #d8dee2;font-size:12px;color:#79868d;text-align:center}
  @page{margin:10mm}
  @media print{body{padding:0}}
</style></head><body>
<header>
  ${p.photoUrl ? `<img src="${p.photoUrl}" alt="Faculty Photo" class="faculty-photo" />` : '<div style="width:90px;height:100px"></div>'}
  <div class="header-info">
    <h1>${esc(name)}</h1>
    <h3>${dash(p.designation)} &nbsp;·&nbsp; ${dash(p.department)}</h3>
    <p>Walchand Institute of Technology, Solapur</p>
    <p style="margin-top:6px">Faculty ID ${dash(profile.facultyId)} &nbsp;|&nbsp; ${dash(c.email)} &nbsp;|&nbsp; ${dash(c.mobile)}</p>
  </div>
  <img src="/wit-logo.jpg" alt="WIT Solapur Logo" class="wit-logo-square" />
</header>

${section('1. Personal details', table([
    ['Full name', name],
    ['Department', p.department],
    ['Designation', p.designation],
    ['Official email', p.officialEmail],
    ['Date of birth', formatDate(p.dob)],
    ['Gender', p.gender],
    ['Blood group', p.bloodGroup]
  ]))}

${section('2. Contact details', table([
    ['Email', c.email],
    ['Mobile', c.mobile ? `${c.mobileCode} ${c.mobile}` : ''],
    ['Emergency contact', c.emergency ? `${c.emergencyCode} ${c.emergency}` : ''],
    ['Current address', c.currentAddress],
    ['Permanent address', c.sameAsCurrent ? c.currentAddress : c.permanentAddress]
  ]))}

${section('3. Qualification details', table([
    ['Highest qualification', q.highest],
    ['UG degree', [q.ug.degree, q.ug.specialization].filter(Boolean).join(' — ')],
    ['UG university', q.ug.university],
    ['UG college', q.ug.college],
    ['UG passing year', q.ug.year],
    ['PG degree', [q.pg.degree, q.pg.specialization].filter(Boolean).join(' — ')],
    ['PG university', q.pg.university],
    ['PG passing year', q.pg.year],
    ['Ph.D. status', q.phd.status],
    ['Ph.D. university', q.phd.university],
    ['Research area', q.phd.area],
    ['Ph.D. years', [q.phd.admissionYear, q.phd.expectedYear, q.phd.awardedYear].filter(Boolean).join(' / ')]
  ]))}

${section('4. Professional details',
    table([
      ['Teaching experience', `${pr.teachYears || 0} years ${pr.teachMonths || 0} months`],
      ['Industry experience', `${pr.indYears || 0} years ${pr.indMonths || 0} months`],
      ['Membership of Professional Bodies', [...pr.bodies, pr.otherBody].filter(Boolean).join(', ')]
    ]) +
    `<p><strong>Specializations</strong></p>${tags(pr.specializations)}
     <p><strong>Research areas</strong></p>${tags(pr.researchAreas)}
     <p><strong>Skills</strong></p>${tags(pr.skills)}`
  )}

${section('5. Faculty training by industry', cardList(profile.industryTrainings, (r) => ({
    heading: r.company,
    pairs: [
      ['Industry sector', r.sector], ['Location', r.location], ['Discipline', r.discipline],
      ['Training level', r.level], ['Duration', `${formatDate(r.from)} to ${formatDate(r.to)}`],
      ['Employee ID', r.empId], ['Description', r.description], ['Proof', r.proofUrl]
    ]
  }), 'No industry training recorded.'))}

${section('6. FDP / STTP / Workshop', cardList(profile.programs, (r) => ({
    heading: r.title,
    pairs: [
      ['Participation', r.participation], ['Programme type', r.types.join(', ')],
      ['Capacity', r.capacity], ['Organizer', r.organizer],
      ['Schedule', `${formatDate(r.from)} to ${formatDate(r.to)}`], ['Mode', r.mode],
      ['Venue', [r.venueName, r.city, r.platform].filter(Boolean).join(', ')], ['Proof', r.proofUrl]
    ]
  }), 'No programmes recorded.'))}

${section('7. Research publications', cardList(profile.publications, (r) => ({
    heading: r.title,
    pairs: [
      ['Authors', r.authors.join(', ')], ['Type', r.type], ['Published in', r.source],
      ['ISSN / ISBN', r.issn], ['Publisher', r.publisher], ['Venue', r.venue],
      ['Publication date', [r.month, r.year].filter(Boolean).join(' ')], ['DOI / link', r.link]
    ]
  }), 'No publications recorded.'))}

${section('8. Patent details', cardList(profile.patents, (r) => ({
    heading: r.title,
    pairs: [
      ['Application number', r.appNo], ['Status', r.status],
      ['Inventors', r.inventors.filter(Boolean).join(', ')],
      ['Applicants', r.applicants.filter(Boolean).join(', ')],
      ['Filed', formatDate(r.filedDate)], ['Publication number', r.pubNo],
      ['Published', formatDate(r.pubDate)], ['Grant number', r.grantNo],
      ['Granted', formatDate(r.grantDate)], ['Earnings', formatRupees(r.earnings)],
      ['Proof', proofText(r.proof)]
    ]
  }), 'No patents recorded.'))}

${section('9. Achievements and awards', cardList(profile.awards, (r) => ({
    heading: r.title,
    pairs: [
      ['Awarding agency', r.agency],
      ['Category', r.category === 'Other' ? r.otherCategory : r.category],
      ['Level', r.level], ['Date of award', formatDate(r.date)],
      ['Award year', r.date ? new Date(r.date).getFullYear() : ''],
      ['Proof', proofText(r.proof)]
    ]
  }), 'No awards recorded.'))}

${section('10. Financial support', cardList(profile.financialSupport, (r) => ({
    heading: r.event,
    pairs: [
      ['Year', r.year], ['Funding organization', r.body],
      ['Amount', formatRupees(r.amount)], ['Purpose', r.purpose], ['Proof', proofText(r.proof)]
    ]
  }), 'No financial support recorded.'))}

${section('11. Projects and consultancy', cardList(profile.projects, (r) => ({
    heading: r.title,
    pairs: [
      ['Project type', r.type], ['Funding agency', r.agency], ['Order number', r.orderNo],
      ['Sanctioned on', formatDate(r.sanctionDate)],
      ['Duration', `${formatDate(r.from)} to ${formatDate(r.to)}`],
      ['Sanctioned amount', formatRupees(r.sanctioned)],
      ['Amount received', r.received === 'Yes' ? formatRupees(r.receivedAmount) : 'Not received yet'],
      ['Status', r.status], ['Proof', proofText(r.proof)]
    ]
  }), 'No projects recorded.'))}

${section('12a. NPTEL courses', cardList(profile.nptelCourses, (r) => ({
    heading: r.title,
    pairs: [
      ['Duration', `${formatDate(r.from)} to ${formatDate(r.to)}`],
      ['Result', r.result], ['Certificate', proofText(r.certificate)]
    ]
  }), 'No NPTEL courses recorded.'))}

${section('12b. Other courses', cardList(profile.otherCourses, (r) => ({
    heading: r.title,
    pairs: [
      ['Platform', r.platform], ['Duration', `${formatDate(r.from)} to ${formatDate(r.to)}`],
      ['Award', r.award], ['Certificate', proofText(r.certificate)]
    ]
  }), 'No other courses recorded.'))}

<footer>Generated by Faculty 360 on ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}.</footer>
</body></html>`;
}

/* opens the sheet in a new tab and starts the print dialogue */
export function printProfile(profile) {
  const htmlStr = buildProfileHtml(profile);
  const cssMatch = htmlStr.match(/<style>([\s\S]*?)<\/style>/i);
  const bodyMatch = htmlStr.match(/<body>([\s\S]*?)<\/body>/i);
  
  const container = document.createElement('div');
  container.innerHTML = `<style>${cssMatch ? cssMatch[1] : ''}</style><div style="background:#fff; padding: 15px 25px;">${bodyMatch ? bodyMatch[1] : ''}</div>`;

  const opt = {
    margin: [0, 0],
    filename: fileStem(profile) + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(container).save();
  return true;
}

/* saves the same sheet as a standalone .html file */
export function downloadHtml(profile) {
  triggerDownload(
    new Blob([buildProfileHtml(profile)], { type: 'text/html;charset=utf-8' }),
    `${fileStem(profile)}.html`
  );
}
