const mongoose = require('mongoose');

const { Schema } = mongoose;
const opts = { _id: false };

/* a stored file or an external link */
const proofSchema = new Schema(
  {
    mode: { type: String, enum: ['link', 'file'], default: 'link' },
    url: { type: String, default: '' },
    fileName: { type: String, default: '' },
    filePath: { type: String, default: '' },
    fileSize: { type: Number, default: 0 }
  },
  opts
);

/* ---------- single value sections ---------- */

const personalSchema = new Schema(
  {
    photoUrl: { type: String, default: '' },
    firstName: { type: String, trim: true, default: '' },
    middleName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    officialEmail: { type: String, lowercase: true, trim: true, default: '' },
    dob: { type: String, default: '' },
    gender: { type: String, default: '' },
    bloodGroup: { type: String, default: '' }
  },
  opts
);

const contactSchema = new Schema(
  {
    email: { type: String, lowercase: true, trim: true, default: '' },
    mobileCode: { type: String, default: '+91' },
    mobile: { type: String, default: '' },
    emergencyCode: { type: String, default: '+91' },
    emergency: { type: String, default: '' },
    currentAddress: { type: String, default: '' },
    sameAsCurrent: { type: Boolean, default: false },
    permanentAddress: { type: String, default: '' }
  },
  opts
);

const degreeSchema = new Schema(
  {
    degree: { type: String, default: '' },
    specialization: { type: String, default: '' },
    university: { type: String, default: '' },
    college: { type: String, default: '' },
    year: { type: String, default: '' }
  },
  opts
);

const qualificationSchema = new Schema(
  {
    highest: { type: String, default: '' },
    ug: { type: degreeSchema, default: () => ({}) },
    pg: { type: degreeSchema, default: () => ({}) },
    phd: {
      type: new Schema(
        {
          status: { type: String, default: '' },
          university: { type: String, default: '' },
          area: { type: String, default: '' },
          admissionYear: { type: String, default: '' },
          expectedYear: { type: String, default: '' },
          awardedYear: { type: String, default: '' }
        },
        opts
      ),
      default: () => ({})
    }
  },
  opts
);

const professionalSchema = new Schema(
  {
    teachYears: { type: String, default: '' },
    teachMonths: { type: String, default: '' },
    indYears: { type: String, default: '' },
    indMonths: { type: String, default: '' },
    specializations: { type: [String], default: [] },
    researchAreas: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    bodies: { type: [String], default: [] },
    otherBody: { type: String, default: '' }
  },
  opts
);

/* ---------- repeatable sections ---------- */

const trainingSchema = new Schema({
  company: { type: String, required: true },
  sector: { type: String, required: true },
  location: String,
  firstName: String,
  lastName: String,
  empId: String,
  discipline: String,
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional', ''] },
  from: String,
  to: String,
  description: String,
  proofUrl: String
});

const programSchema = new Schema({
  participation: { type: String, enum: ['Attended', 'Conducted', 'Organized', ''] },
  types: { type: [String], default: [] },
  otherType: String,
  title: { type: String, required: true },
  capacity: String,
  from: String,
  to: String,
  organizer: String,
  mode: { type: String, enum: ['Offline', 'Online', 'Hybrid', ''] },
  venueName: String,
  city: String,
  platform: String,
  proofUrl: String
});

const publicationSchema = new Schema({
  authors: { type: [String], default: [] },
  title: { type: String, required: true },
  type: String,
  source: String,
  issn: String,
  publisher: String,
  venue: String,
  month: String,
  year: String,
  link: String
});

const patentSchema = new Schema({
  appNo: { type: String, required: true },
  status: String,
  inventors: { type: [String], default: [] },
  title: { type: String, required: true },
  applicants: { type: [String], default: [] },
  filedDate: String,
  pubNo: String,
  pubDate: String,
  grantNo: String,
  grantDate: String,
  earnings: { type: Number, default: 0 },
  proof: { type: proofSchema, default: () => ({}) }
});

const awardSchema = new Schema({
  title: { type: String, required: true },
  agency: String,
  category: String,
  otherCategory: String,
  level: String,
  date: String,
  proof: { type: proofSchema, default: () => ({}) }
});

const supportSchema = new Schema({
  year: String,
  event: { type: String, required: true },
  body: String,
  amount: { type: Number, default: 0 },
  purpose: String,
  proof: { type: proofSchema, default: () => ({}) }
});

const projectSchema = new Schema({
  type: String,
  agency: String,
  title: { type: String, required: true },
  orderNo: String,
  sanctionDate: String,
  from: String,
  to: String,
  sanctioned: { type: Number, default: 0 },
  received: { type: String, enum: ['Yes', 'No'], default: 'No' },
  receivedAmount: { type: Number, default: 0 },
  status: String,
  proof: { type: proofSchema, default: () => ({}) }
});

const nptelSchema = new Schema({
  title: { type: String, required: true },
  from: String,
  to: String,
  result: String,
  certificate: { type: proofSchema, default: () => ({}) }
});

const courseSchema = new Schema({
  platform: String,
  title: { type: String, required: true },
  from: String,
  to: String,
  award: String,
  certificate: { type: proofSchema, default: () => ({}) }
});

/* ---------- root document ---------- */

const facultySchema = new Schema(
  {
    facultyId: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ['draft', 'submitted', 'approved', 'returned'], default: 'draft' },
    completion: { type: Number, default: 0 },
    submittedAt: Date,
    referenceNo: String,

    personalDetails: { type: personalSchema, default: () => ({}) },
    contactDetails: { type: contactSchema, default: () => ({}) },
    qualifications: { type: qualificationSchema, default: () => ({}) },
    professionalDetails: { type: professionalSchema, default: () => ({}) },

    industryTrainings: { type: [trainingSchema], default: [] },
    programs: { type: [programSchema], default: [] },
    publications: { type: [publicationSchema], default: [] },
    patents: { type: [patentSchema], default: [] },
    awards: { type: [awardSchema], default: [] },
    financialSupport: { type: [supportSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    nptelCourses: { type: [nptelSchema], default: [] },
    otherCourses: { type: [courseSchema], default: [] },

    /* sections the faculty marked as having nothing to report */
    notApplicable: { type: Map, of: Boolean, default: {} }
  },
  { timestamps: true }
);

facultySchema.virtual('fullName').get(function () {
  const p = this.personalDetails || {};
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');
});

facultySchema.set('toJSON', { virtuals: true });
facultySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Faculty', facultySchema);
