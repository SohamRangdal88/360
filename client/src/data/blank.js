/* Empty profile factory and blank record constructors.
   Every field gets a default so the form never sees undefined. */

let rowCounter = 0;
const nextRowId = () => `row-${Date.now()}-${++rowCounter}`;

export function emptyProfile() {
  return {
    facultyId: '',
    status: 'draft',
    completion: 0,

    personalDetails: {
      photoUrl: '',
      firstName: '',
      middleName: '',
      lastName: '',
      department: '',
      designation: '',
      officialEmail: '',
      dob: '',
      gender: '',
      bloodGroup: ''
    },

    contactDetails: {
      email: '',
      mobileCode: '+91',
      mobile: '',
      emergencyCode: '+91',
      emergency: '',
      currentAddress: '',
      sameAsCurrent: false,
      permanentAddress: ''
    },

    qualifications: {
      highest: '',
      ug: { degree: '', specialization: '', university: '', college: '', year: '' },
      pg: { degree: '', specialization: '', university: '', college: '', year: '' },
      phd: { status: '', university: '', area: '', admissionYear: '', expectedYear: '', awardedYear: '' }
    },

    professionalDetails: {
      dateOfJoining: '',
      teachYears: '',
      teachMonths: '',
      indYears: '',
      indMonths: '',
      specializations: [],
      researchAreas: [],
      skills: [],
      bodies: [],
      otherBody: ''
    },

    industryTrainings: [],
    programs: [],
    publications: [],
    patents: [],
    awards: [],
    financialSupport: [],
    projects: [],
    nptelCourses: [],
    otherCourses: [],

    notApplicable: {}
  };
}

export const blankRecord = {
  industryTrainings: () => ({
    rowId: nextRowId(),
    company: '', sector: '', location: '', firstName: '', lastName: '',
    empId: '', discipline: '', level: '', from: '', to: '', description: '', proofUrl: ''
  }),

  programs: () => ({
    rowId: nextRowId(),
    participation: '', types: [], otherType: '', title: '', capacity: '',
    from: '', to: '', organizer: '', awardingAgency: '', mode: '', venueName: '', city: '', platform: '', proofUrl: ''
  }),

  publications: () => ({
    rowId: nextRowId(),
    authors: [''], title: '', type: '', source: '', issn: '', publisher: '',
    venue: '', month: '', year: '', link: ''
  }),

  patents: () => ({
    rowId: nextRowId(),
    appNo: '', status: '', inventors: [''], title: '', applicants: [''],
    filedDate: '', pubNo: '', pubDate: '', grantNo: '', grantDate: '',
    earnings: '', proof: { mode: 'link', url: '', fileName: '', filePath: '', fileSize: 0 }
  }),

  awards: () => ({
    rowId: nextRowId(),
    title: '', agency: '', category: '', otherCategory: '', level: '', date: '',
    proof: { mode: 'link', url: '', fileName: '', filePath: '', fileSize: 0 }
  }),

  financialSupport: () => ({
    rowId: nextRowId(),
    year: '', event: '', body: '', amount: '', purpose: '',
    proof: { mode: 'link', url: '', fileName: '', filePath: '', fileSize: 0 }
  }),

  projects: () => ({
    rowId: nextRowId(),
    type: '', agency: '', principalInvestigator: '', title: '', orderNo: '', sanctionDate: '',
    from: '', to: '', sanctioned: '', received: 'No', receivedAmount: '', status: '',
    proof: { mode: 'link', url: '', fileName: '', filePath: '', fileSize: 0 }
  }),

  nptelCourses: () => ({
    rowId: nextRowId(),
    title: '', from: '', to: '', durationWeeks: '', result: '',
    certificate: { mode: 'link', url: '', fileName: '', filePath: '', fileSize: 0 }
  }),

  otherCourses: () => ({
    rowId: nextRowId(),
    platform: '', title: '', from: '', to: '', award: '',
    certificate: { mode: 'link', url: '', fileName: '', filePath: '', fileSize: 0 }
  })
};

/* add rowId to every record in a loaded profile */
export function withRowIds(profile) {
  const copy = { ...profile };
  const lists = [
    'industryTrainings', 'programs', 'publications', 'patents', 'awards',
    'financialSupport', 'projects', 'nptelCourses', 'otherCourses'
  ];
  lists.forEach((key) => {
    if (Array.isArray(copy[key])) {
      copy[key] = copy[key].map((r) => (r.rowId ? r : { ...r, rowId: nextRowId() }));
    }
  });
  return copy;
}
