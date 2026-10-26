/* Builds the two server side download formats:
   - a print ready HTML sheet (the browser turns it into a PDF)
   - a flat CSV of every repeatable record                        */

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const dash = (v) => (String(v ?? '').trim() === '' ? '—' : v);

const money = (n) => {
  const v = Number(n || 0);
  return v > 0 ? '₹' + v.toLocaleString('en-IN') : '—';
};

const day = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  return isNaN(x) ? d : x.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const proofText = (p = {}) => (p.mode === 'file' ? p.fileName || 'Uploaded file' : p.url || '—');

function rows(pairs) {
  return pairs
    .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(dash(v))}</td></tr>`)
    .join('');
}

function block(title, inner) {
  return `<section class="block"><h2>${esc(title)}</h2>${inner}</section>`;
}

function emptyNote(text) {
  return `<p class="none">${esc(text)}</p>`;
}

function cards(list, builder, emptyText) {
  if (!list || !list.length) return emptyNote(emptyText);
  return list
    .map((r, i) => `<div class="card"><h3>${i + 1}. ${esc(builder(r).heading)}</h3><table>${rows(builder(r).pairs)}</table></div>`)
    .join('');
}

function buildHtml(f) {
  const p = f.personalDetails || {};
  const c = f.contactDetails || {};
  const q = f.qualifications || {};
  const pr = f.professionalDetails || {};
  const name = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || 'Faculty profile';

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(name)} — Faculty 360 profile</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1b1b1b; background: #fff;
    margin: 0; padding: 32px 40px; font-size: 13px; line-height: 1.55;
  }
  header { border-bottom: 2px solid #123a52; padding-bottom: 16px; margin-bottom: 24px; }
  header h1 { font-size: 22px; margin: 0 0 4px; }
  header p { margin: 0; color: #55636b; font-size: 12px; }
  .meta { margin-top: 10px; font-size: 12px; color: #55636b; }
  .block { margin-bottom: 26px; page-break-inside: avoid; }
  .block h2 { font-size: 14px; margin: 0 0 10px; padding-bottom: 6px;
    border-bottom: 1px solid #d8dee2; color: #123a52; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  th, td { text-align: left; vertical-align: top; padding: 5px 8px; border-bottom: 1px solid #eceff1; }
  th { width: 210px; font-weight: 600; color: #44525a; }
  .card { border: 1px solid #dde3e6; border-radius: 4px; padding: 12px 14px; margin-bottom: 10px; }
  .card h3 { font-size: 13px; margin: 0 0 8px; }
  .card table { margin: 0; }
  .none { color: #79868d; font-style: italic; margin: 0 0 8px; }
  .tags span { display: inline-block; border: 1px solid #cfd8dc; border-radius: 3px;
    padding: 2px 7px; margin: 0 5px 5px 0; font-size: 12px; }
  footer { margin-top: 30px; border-top: 1px solid #d8dee2; padding-top: 10px;
    font-size: 11px; color: #79868d; }
  @page { margin: 14mm; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<header>
  <h1>${esc(name)}</h1>
  <p>${esc(dash(p.designation))} &nbsp;·&nbsp; ${esc(dash(p.department))}</p>
  <p class="meta">Faculty ID ${esc(f.facultyId)} &nbsp;·&nbsp; Profile ${f.completion || 0}% complete &nbsp;·&nbsp; Status: ${esc(f.status)}</p>
</header>

${block('1. Personal details', `<table>${rows([
    ['Full name', name],
    ['Department', p.department],
    ['Designation', p.designation],
    ['Official email', p.officialEmail],
    ['Date of birth', day(p.dob)],
    ['Gender', p.gender],
    ['Blood group', p.bloodGroup]
  ])}</table>`)}

${block('2. Contact details', `<table>${rows([
    ['Email', c.email],
    ['Mobile', c.mobile ? `${c.mobileCode} ${c.mobile}` : ''],
    ['Emergency contact', c.emergency ? `${c.emergencyCode} ${c.emergency}` : ''],
    ['Current address', c.currentAddress],
    ['Permanent address', c.sameAsCurrent ? c.currentAddress : c.permanentAddress]
  ])}</table>`)}

${block('3. Qualification details', `<table>${rows([
    ['Highest qualification', q.highest],
    ['UG degree', [q.ug?.degree, q.ug?.specialization].filter(Boolean).join(' — ')],
    ['UG university', q.ug?.university],
    ['UG college', q.ug?.college],
    ['UG passing year', q.ug?.year],
    ['PG degree', [q.pg?.degree, q.pg?.specialization].filter(Boolean).join(' — ')],
    ['PG university', q.pg?.university],
    ['PG passing year', q.pg?.year],
    ['Ph.D. status', q.phd?.status],
    ['Ph.D. university', q.phd?.university],
    ['Research area', q.phd?.area],
    ['Ph.D. years', [q.phd?.admissionYear, q.phd?.expectedYear, q.phd?.awardedYear].filter(Boolean).join(' / ')]
  ])}</table>`)}

${block('4. Professional details', `<table>${rows([
    ['Teaching experience', `${dash(pr.teachYears)} years ${pr.teachMonths || 0} months`],
    ['Industry experience', `${dash(pr.indYears)} years ${pr.indMonths || 0} months`],
    ['Membership of Professional Bodies', (pr.bodies || []).join(', ')]
  ])}</table>
  <p><strong>Specializations</strong></p><p class="tags">${(pr.specializations || []).map((s) => `<span>${esc(s)}</span>`).join('') || '—'}</p>
  <p><strong>Research areas</strong></p><p class="tags">${(pr.researchAreas || []).map((s) => `<span>${esc(s)}</span>`).join('') || '—'}</p>
  <p><strong>Skills</strong></p><p class="tags">${(pr.skills || []).map((s) => `<span>${esc(s)}</span>`).join('') || '—'}</p>`)}

${block('5. Faculty training by industry', cards(f.industryTrainings, (r) => ({
    heading: r.company,
    pairs: [
      ['Industry sector', r.sector], ['Location', r.location], ['Discipline', r.discipline],
      ['Training level', r.level], ['Duration', `${day(r.from)} to ${day(r.to)}`],
      ['Description', r.description], ['Proof', r.proofUrl]
    ]
  }), 'No industry training recorded.'))}

${block('6. FDP / STTP / Workshop', cards(f.programs, (r) => ({
    heading: r.title,
    pairs: [
      ['Participation', r.participation], ['Programme type', (r.types || []).join(', ')],
      ['Capacity', r.capacity], ['Organizer', r.organizer],
      ['Schedule', `${day(r.from)} to ${day(r.to)}`],
      ['Mode', r.mode], ['Venue', [r.venueName, r.city, r.platform].filter(Boolean).join(', ')],
      ['Proof', r.proofUrl]
    ]
  }), 'No programmes recorded.'))}

${block('7. Research publications', cards(f.publications, (r) => ({
    heading: r.title,
    pairs: [
      ['Authors', (r.authors || []).join(', ')], ['Type', r.type], ['Published in', r.source],
      ['ISSN / ISBN', r.issn], ['Publisher', r.publisher], ['Venue', r.venue],
      ['Publication date', [r.month, r.year].filter(Boolean).join(' ')], ['DOI / link', r.link]
    ]
  }), 'No publications recorded.'))}

${block('8. Patent details', cards(f.patents, (r) => ({
    heading: r.title,
    pairs: [
      ['Application number', r.appNo], ['Status', r.status],
      ['Inventors', (r.inventors || []).filter(Boolean).join(', ')],
      ['Applicants', (r.applicants || []).filter(Boolean).join(', ')],
      ['Filed', day(r.filedDate)], ['Publication number', r.pubNo], ['Published', day(r.pubDate)],
      ['Grant number', r.grantNo], ['Granted', day(r.grantDate)],
      ['Earnings', money(r.earnings)], ['Proof', proofText(r.proof)]
    ]
  }), 'No patents recorded.'))}

${block('9. Achievements and awards', cards(f.awards, (r) => ({
    heading: r.title,
    pairs: [
      ['Awarding agency', r.agency],
      ['Category', r.category === 'Other' ? r.otherCategory : r.category],
      ['Level', r.level], ['Date of award', day(r.date)],
      ['Award year', r.date ? new Date(r.date).getFullYear() : ''],
      ['Proof', proofText(r.proof)]
    ]
  }), 'No awards recorded.'))}

${block('10. Financial support', cards(f.financialSupport, (r) => ({
    heading: r.event,
    pairs: [
      ['Year', r.year], ['Funding organization', r.body],
      ['Amount', money(r.amount)], ['Purpose', r.purpose], ['Proof', proofText(r.proof)]
    ]
  }), 'No financial support recorded.'))}

${block('11. Projects and consultancy', cards(f.projects, (r) => ({
    heading: r.title,
    pairs: [
      ['Project type', r.type], ['Funding agency', r.agency], ['Order number', r.orderNo],
      ['Sanctioned on', day(r.sanctionDate)], ['Duration', `${day(r.from)} to ${day(r.to)}`],
      ['Sanctioned amount', money(r.sanctioned)],
      ['Amount received', r.received === 'Yes' ? money(r.receivedAmount) : 'Not received yet'],
      ['Status', r.status], ['Proof', proofText(r.proof)]
    ]
  }), 'No projects recorded.'))}

${block('12a. NPTEL courses', cards(f.nptelCourses, (r) => ({
    heading: r.title,
    pairs: [['Duration', `${day(r.from)} to ${day(r.to)}`], ['Result', r.result], ['Certificate', proofText(r.certificate)]]
  }), 'No NPTEL courses recorded.'))}

${block('12b. Other courses', cards(f.otherCourses, (r) => ({
    heading: r.title,
    pairs: [['Platform', r.platform], ['Duration', `${day(r.from)} to ${day(r.to)}`], ['Award', r.award], ['Certificate', proofText(r.certificate)]]
  }), 'No other courses recorded.'))}

<footer>
  Generated by Faculty 360 on ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}.
  ${f.referenceNo ? 'Reference ' + esc(f.referenceNo) + '.' : ''}
</footer>
<script>
  // opens the print dialogue so the sheet can be saved as a PDF
  if (location.search.indexOf('print=1') > -1) { window.onload = function () { window.print(); }; }
</script>
</body>
</html>`;
  return html;
}

/* ---------------- CSV ---------------- */

const csvCell = (v) => {
  const s = String(v ?? '').replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
};

function buildCsv(f) {
  const lines = [];
  const push = (arr) => lines.push(arr.map(csvCell).join(','));
  push(['Section', 'Record', 'Field', 'Value']);

  const flat = (section, index, obj) => {
    Object.keys(obj).forEach((k) => {
      const v = obj[k];
      if (v === null || v === undefined || v === '') return;
      push([section, index, k, Array.isArray(v) ? v.join(' | ') : typeof v === 'object' ? JSON.stringify(v) : v]);
    });
  };

  flat('Personal details', 1, f.personalDetails || {});
  flat('Contact details', 1, f.contactDetails || {});
  flat('Qualifications', 1, {
    highest: f.qualifications?.highest,
    ...Object.fromEntries(Object.entries(f.qualifications?.ug || {}).map(([k, v]) => ['ug_' + k, v])),
    ...Object.fromEntries(Object.entries(f.qualifications?.pg || {}).map(([k, v]) => ['pg_' + k, v])),
    ...Object.fromEntries(Object.entries(f.qualifications?.phd || {}).map(([k, v]) => ['phd_' + k, v]))
  });
  flat('Professional details', 1, f.professionalDetails || {});

  const lists = {
    'Industry trainings': f.industryTrainings,
    'FDP STTP Workshop': f.programs,
    Publications: f.publications,
    Patents: f.patents,
    Awards: f.awards,
    'Financial support': f.financialSupport,
    Projects: f.projects,
    'NPTEL courses': f.nptelCourses,
    'Other courses': f.otherCourses
  };

  Object.entries(lists).forEach(([label, list]) => {
    (list || []).forEach((r, i) => {
      const plain = typeof r.toObject === 'function' ? r.toObject() : r;
      delete plain._id;
      flat(label, i + 1, plain);
    });
  });

  return lines.join('\n');
}

module.exports = { buildHtml, buildCsv };
