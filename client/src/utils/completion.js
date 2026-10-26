/* Client-side completion scoring — must mirror server/utils/completion.js */

const REQUIRED = {
  personalDetails: ['firstName', 'lastName', 'department', 'designation', 'officialEmail', 'dob', 'gender'],
  contactDetails: ['email', 'mobile', 'currentAddress'],
  qualifications: (doc) => {
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
  const filled = fields.filter((f) => {
    const v = getVal(data, f);
    if (Array.isArray(v)) return v.length > 0;
    return v !== '' && v !== null && v !== undefined;
  });
  return Math.round((filled.length / fields.length) * 100);
}

function listScore(list, na) {
  if (na) return 100;
  if (!list || list.length === 0) return 0;
  return 100;
}

export function computeScores(profile) {
  const na = profile.notApplicable || {};

  const scores = [];

  scores.push(singleScore(profile.personalDetails, REQUIRED.personalDetails));
  scores.push(singleScore(profile.contactDetails, REQUIRED.contactDetails));

  const qFields = typeof REQUIRED.qualifications === 'function'
    ? REQUIRED.qualifications(profile.qualifications || {})
    : REQUIRED.qualifications;
  scores.push(singleScore(profile.qualifications, qFields));
  scores.push(singleScore(profile.professionalDetails, REQUIRED.professionalDetails));

  scores.push(listScore(profile.industryTrainings, na.industryTrainings));
  scores.push(listScore(profile.programs, na.programs));
  scores.push(listScore(profile.publications, na.publications));
  scores.push(listScore(profile.patents, na.patents));
  scores.push(listScore(profile.awards, na.awards));
  scores.push(listScore(profile.financialSupport, na.financialSupport));
  scores.push(listScore(profile.projects, na.projects));

  const nptel = profile.nptelCourses || [];
  const other = profile.otherCourses || [];
  const courseNa = na.nptelCourses || na.otherCourses;
  scores.push(courseNa ? 100 : (nptel.length + other.length > 0 ? 100 : 0));

  return scores;
}

export function overallPercent(scores) {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
