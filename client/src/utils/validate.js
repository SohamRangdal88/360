/* Per-section validation rules. Runs on "Save and continue", never on "Save draft". */

import { SECTIONS } from '../data/constants';

const required = (v) => !v || String(v).trim() === '';
const badEmail = (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const badPhone = (v) => v && !/^\d[\d\s]{6,14}$/.test(v.trim());

export function validateSection(tabIndex, profile) {
  const errors = {};
  const s = SECTIONS[tabIndex];
  if (!s) return errors;

  const err = (key, msg) => { errors[key] = msg; };

  switch (s.key) {
    case 'personalDetails': {
      const p = profile.personalDetails;
      if (required(p.firstName)) err('personalDetails.firstName', 'First name is required');
      if (required(p.lastName)) err('personalDetails.lastName', 'Last name is required');
      if (required(p.department)) err('personalDetails.department', 'Select a department');
      if (required(p.designation)) err('personalDetails.designation', 'Select a designation');
      if (required(p.officialEmail)) err('personalDetails.officialEmail', 'Official email is required');
      else if (badEmail(p.officialEmail)) err('personalDetails.officialEmail', 'Enter a valid email');
      if (required(p.dob)) err('personalDetails.dob', 'Date of birth is required');
      if (required(p.gender)) err('personalDetails.gender', 'Select gender');
      break;
    }

    case 'contactDetails': {
      const c = profile.contactDetails;
      if (required(c.email)) err('contactDetails.email', 'Email is required');
      else if (badEmail(c.email)) err('contactDetails.email', 'Enter a valid email');
      if (required(c.mobile)) err('contactDetails.mobile', 'Mobile number is required');
      else if (badPhone(c.mobile)) err('contactDetails.mobile', 'Enter a valid phone number');
      if (c.emergency && c.mobile && c.emergency.replace(/\s/g, '') === c.mobile.replace(/\s/g, '')) {
        err('contactDetails.emergency', 'Emergency number must be different from your own');
      }
      if (required(c.currentAddress)) err('contactDetails.currentAddress', 'Current address is required');
      break;
    }

    case 'qualifications': {
      const q = profile.qualifications;
      if (required(q.highest)) err('qualifications.highest', 'Select highest qualification');
      if (required(q.ug?.degree)) err('qualifications.ug.degree', 'UG degree is required');
      if (required(q.ug?.university)) err('qualifications.ug.university', 'UG university is required');
      if (required(q.ug?.year)) err('qualifications.ug.year', 'UG passing year is required');
      if (q.pg?.year && q.ug?.year && Number(q.pg.year) < Number(q.ug.year)) {
        err('qualifications.pg.year', 'PG year cannot be before UG year');
      }
      break;
    }

    case 'professionalDetails': {
      const pr = profile.professionalDetails;
      if (required(pr.teachYears)) err('professionalDetails.teachYears', 'Teaching experience is required');
      break;
    }

    case 'industryTrainings': {
      if (profile.notApplicable?.industryTrainings) break;
      (profile.industryTrainings || []).forEach((r, i) => {
        if (required(r.company)) err(`industryTrainings.${i}.company`, 'Company is required');
        if (required(r.sector)) err(`industryTrainings.${i}.sector`, 'Sector is required');
        if (r.from && r.to && r.to < r.from) err(`industryTrainings.${i}.to`, 'End date must be after start');
      });
      break;
    }

    case 'programs': {
      if (profile.notApplicable?.programs) break;
      (profile.programs || []).forEach((r, i) => {
        if (required(r.title)) err(`programs.${i}.title`, 'Title is required');
        if (r.from && r.to && r.to < r.from) err(`programs.${i}.to`, 'End date must be after start');
      });
      break;
    }

    case 'publications': {
      if (profile.notApplicable?.publications) break;
      (profile.publications || []).forEach((r, i) => {
        if (required(r.title)) err(`publications.${i}.title`, 'Title is required');
      });
      break;
    }

    case 'patents': {
      if (profile.notApplicable?.patents) break;
      (profile.patents || []).forEach((r, i) => {
        if (required(r.appNo)) err(`patents.${i}.appNo`, 'Application number is required');
        if (required(r.title)) err(`patents.${i}.title`, 'Title is required');
      });
      break;
    }

    case 'awards': {
      if (profile.notApplicable?.awards) break;
      (profile.awards || []).forEach((r, i) => {
        if (required(r.title)) err(`awards.${i}.title`, 'Award title is required');
      });
      break;
    }

    case 'financialSupport': {
      if (profile.notApplicable?.financialSupport) break;
      (profile.financialSupport || []).forEach((r, i) => {
        if (required(r.event)) err(`financialSupport.${i}.event`, 'Event name is required');
      });
      break;
    }

    case 'projects': {
      if (profile.notApplicable?.projects) break;
      (profile.projects || []).forEach((r, i) => {
        if (required(r.title)) err(`projects.${i}.title`, 'Project title is required');
        if (r.from && r.to && r.to < r.from) err(`projects.${i}.to`, 'End date must be after start');
      });
      break;
    }

    case 'nptelCourses': {
      if (profile.notApplicable?.nptelCourses) break;
      (profile.nptelCourses || []).forEach((r, i) => {
        if (required(r.title)) err(`nptelCourses.${i}.title`, 'Course title is required');
      });
      (profile.otherCourses || []).forEach((r, i) => {
        if (required(r.title)) err(`otherCourses.${i}.title`, 'Course title is required');
      });
      break;
    }

    default:
      break;
  }

  return errors;
}
