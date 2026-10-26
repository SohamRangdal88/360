/* =========================================================================
   constants.js — dropdown lists, section metadata, country codes
   ========================================================================= */

export const DEPARTMENTS = [
  'Information Technology',
  'Artificial Intelligence and Machine Learning',
  'Civil Engineering',
  'Computer Science and Engineering',
  'Electronics and Computer Engineering',
  'Electronics and Telecommunication Engineering',
  'General Engineering',
  'Mechanical and Automation Engineering'
];

export const DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
  'Head of Department',
  'Dean',
  'Director',
  'Adjunct Professor',
  'Visiting Faculty'
];

export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const HIGHEST_QUALIFICATIONS = ['Ph.D.', 'Post Graduate', 'Graduate'];

export const UG_DEGREES = ['B.E.', 'B.Tech.', 'B.Sc.', 'B.A.', 'B.Com.', 'BCA', 'BBA'];
export const PG_DEGREES = ['M.E.', 'M.Tech.', 'M.Sc.', 'M.A.', 'M.Com.', 'MCA', 'MBA'];

export const PHD_STATUSES = ['Awarded', 'Pursuing', 'Not applicable'];

export const CAPACITY_OPTIONS = [
  '1-25', '26-50', '51-100', '101-200', '201-500', '500+'
];

export const NPTEL_RESULTS = [
  'Elite', 'Elite + Silver', 'Elite + Gold', 'Successfully Completed', 'Participated', 'Not Completed'
];

export const NPTEL_DURATION_WEEKS = [
  '4', '8', '12', '16', '20', '24'
];

export const INDUSTRY_SECTORS = [
  'Information Technology',
  'Manufacturing',
  'Healthcare',
  'Finance',
  'Energy',
  'Construction',
  'Automobile',
  'Telecommunications',
  'Pharmaceuticals',
  'Education',
  'Research',
  'Government',
  'Other'
];

export const TRAINING_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

export const PARTICIPATION_TYPES = ['Attended', 'Conducted', 'Organized'];

export const PROGRAM_TYPES = [
  'Faculty Development Programme (FDP)',
  'Short Term Training Programme (STTP)',
  'Workshop',
  'Seminar',
  'Conference',
  'Refresher Course',
  'Orientation Programme',
  'Other'
];

export const PROGRAM_MODES = ['Offline', 'Online', 'Hybrid'];

export const PUBLICATION_TYPES = [
  'Journal',
  'Conference',
  'Book',
  'Book Chapter',
  'Technical Report',
  'Other'
];

export const PATENT_STATUSES = ['Filed', 'Published', 'Granted', 'Abandoned'];

export const AWARD_CATEGORIES = [
  'Best Paper Award',
  'Best Teacher Award',
  'Research Excellence',
  'Innovation Award',
  'National Award',
  'International Award',
  'Other'
];

export const AWARD_LEVELS = ['International', 'National', 'State', 'University', 'College', 'Department'];

export const PROJECT_TYPES = [
  'Research Project',
  'Consultancy',
  'Sponsored Project',
  'Industry Collaboration',
  'Government Funded'
];

export const PROJECT_STATUSES = ['Ongoing', 'Completed', 'Sanctioned'];

export const PROFESSIONAL_BODIES = [
  'IEEE',
  'ACM',
  'CSI',
  'ISTE',
  'IETE',
  'IEI',
  'IAENG',
  'ISCA',
  'Other'
];

export const SPECIALIZATIONS = [
  'Machine Learning',
  'Artificial Intelligence',
  'Data Science',
  'Computer Vision',
  'Natural Language Processing',
  'Cyber Security',
  'Cloud Computing',
  'Internet of Things',
  'Blockchain',
  'Embedded Systems',
  'Signal Processing',
  'VLSI Design',
  'Structural Engineering',
  'Thermal Engineering',
  'Power Systems'
];

export const RESEARCH_AREAS = [
  'Deep Learning',
  'Reinforcement Learning',
  'Image Processing',
  'Big Data Analytics',
  'Software Engineering',
  'Network Security',
  'Wireless Networks',
  'Robotics',
  'Control Systems',
  'Renewable Energy',
  'Materials Science',
  'Biomedical Engineering'
];

export const SKILLS = [
  'Python',
  'Java',
  'C++',
  'JavaScript',
  'MATLAB',
  'R',
  'SQL',
  'TensorFlow',
  'PyTorch',
  'React',
  'Node.js',
  'Docker',
  'AWS',
  'LaTeX'
];

export const COUNTRY_CODES = [
  { code: '+91', label: 'IN' },
  { code: '+1', label: 'US' },
  { code: '+44', label: 'UK' },
  { code: '+61', label: 'AU' },
  { code: '+49', label: 'DE' },
  { code: '+33', label: 'FR' },
  { code: '+81', label: 'JP' },
  { code: '+86', label: 'CN' },
  { code: '+971', label: 'AE' },
  { code: '+65', label: 'SG' }
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
export const EDUCATION_YEARS = Array.from(
  { length: currentYear + 10 - 1950 + 1 },
  (_, i) => String(currentYear + 10 - i)
);

export const EXPERIENCE_YEARS = Array.from({ length: 51 }, (_, i) => String(i));
export const EXPERIENCE_MONTHS = Array.from({ length: 12 }, (_, i) => String(i));

/* ---------- section metadata ---------- */

export const SECTIONS = [
  { key: 'personalDetails', name: 'Personal Details', number: 1 },
  { key: 'contactDetails', name: 'Contact Details', number: 2 },
  { key: 'qualifications', name: 'Qualification Details', number: 3 },
  { key: 'professionalDetails', name: 'Professional Details', number: 4 },
  { key: 'industryTrainings', name: 'Industry Training', number: 5, repeatable: true },
  { key: 'programs', name: 'FDP / STTP / Workshop', number: 6, repeatable: true },
  { key: 'publications', name: 'Research Publications', number: 7, repeatable: true },
  { key: 'patents', name: 'Patent Details', number: 8, repeatable: true },
  { key: 'awards', name: 'Achievements and Awards', number: 9, repeatable: true },
  { key: 'financialSupport', name: 'Financial Support', number: 10, repeatable: true },
  { key: 'projects', name: 'Projects and Consultancy', number: 11, repeatable: true },
  { key: 'nptelCourses', name: 'Courses and Certifications', number: 12, repeatable: true }
];
