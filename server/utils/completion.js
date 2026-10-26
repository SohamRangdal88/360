/* Server-side completion scoring.
   Must match client/src/utils/completion.js so the progress bar never jumps after a save. */

const SECTION_KEYS = [
  'personalDetails',
  'contactDetails',
  'qualifications',
  'professionalDetails',
  'industryTrainings',
  'programs',
  'publications',
  'patents',
  'awards',
  'financialSupport',
  'projects',
  'nptelCourses'
  // otherCourses is combined with nptelCourses as section 12
];

/* required fields per section */
const REQUIRED = {
  personalDetails: ['firstName', 'lastName', 'department', 'designation', 'officialEmail', 'dob', 'gender'],
  contactDetails: ['email', 'mobile', 'currentAddress'],
  qualifications: doc => {
    const base = ['highest'];
    if (doc.highest) base.push('ug.degree', 'ug.university', 'ug.year');
    return base;
  },
  professionalDetails: ['teachYears']
};

function getVal(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : ''), obj);
}

function singleScore(data, fields) {
  if (!data || !fields.length) return 0;
  const filled = fields.filter(f => {
    const v = getVal(data, f);
    if (Array.isArray(v)) return v.length > 0;
    return v !== '' && v !== null && v !== undefined;
  });
  return Math.round((filled.length / fields.length) * 100);
}

function listScore(list, na) {
  if (na) return 100;
  if (!list || list.length === 0) return 0;
  return 100; // having at least one record counts as complete
}

function sectionScores(doc) {
  const d = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const na = d.notApplicable || {};

  const scores = [];

  // 1 – personal
  scores.push(singleScore(d.personalDetails, REQUIRED.personalDetails));
  // 2 – contact
  scores.push(singleScore(d.contactDetails, REQUIRED.contactDetails));
  // 3 – qualifications
  const qFields = typeof REQUIRED.qualifications === 'function'
    ? REQUIRED.qualifications(d.qualifications || {})
    : REQUIRED.qualifications;
  scores.push(singleScore(d.qualifications, qFields));
  // 4 – professional
  scores.push(singleScore(d.professionalDetails, REQUIRED.professionalDetails));

  // 5–12 repeatable
  scores.push(listScore(d.industryTrainings, na.industryTrainings || na.get?.('industryTrainings')));
  scores.push(listScore(d.programs, na.programs || na.get?.('programs')));
  scores.push(listScore(d.publications, na.publications || na.get?.('publications')));
  scores.push(listScore(d.patents, na.patents || na.get?.('patents')));
  scores.push(listScore(d.awards, na.awards || na.get?.('awards')));
  scores.push(listScore(d.financialSupport, na.financialSupport || na.get?.('financialSupport')));
  scores.push(listScore(d.projects, na.projects || na.get?.('projects')));

  // section 12: nptel + other courses combined
  const nptel = d.nptelCourses || [];
  const other = d.otherCourses || [];
  const courseNa = na.nptelCourses || na.get?.('nptelCourses') || na.otherCourses || na.get?.('otherCourses');
  scores.push(courseNa ? 100 : (nptel.length + other.length > 0 ? 100 : 0));

  return scores;
}

function overallCompletion(doc) {
  const scores = sectionScores(doc);
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

module.exports = { sectionScores, overallCompletion };
