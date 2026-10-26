/* Loads one sample faculty record into the database.
   Run with:  npm run seed  (from the server directory)  */

require('dotenv').config();
const mongoose = require('mongoose');
const Faculty = require('../models/Faculty');

const SAMPLE = {
  facultyId: 'FAC-2011-0342',
  status: 'draft',
  personalDetails: {
    firstName: 'Priya',
    middleName: '',
    lastName: 'Sharma',
    department: 'Computer Science and Engineering',
    designation: 'Assistant Professor',
    officialEmail: 'priya.sharma@college.edu.in',
    dob: '1988-06-15',
    gender: 'Female',
    bloodGroup: 'B+'
  },
  contactDetails: {
    email: 'priya.sharma@gmail.com',
    mobileCode: '+91',
    mobile: '98765 43210',
    emergencyCode: '+91',
    emergency: '98765 43211',
    currentAddress: '12 Faculty Quarters, Engineering Campus, Pune 411005',
    sameAsCurrent: true,
    permanentAddress: ''
  },
  qualifications: {
    highest: 'Ph.D.',
    ug: { degree: 'B.E.', specialization: 'Computer Engineering', university: 'Savitribai Phule Pune University', college: 'College of Engineering Pune', year: '2009' },
    pg: { degree: 'M.Tech.', specialization: 'Data Science', university: 'IIT Bombay', college: '', year: '2011' },
    phd: { status: 'Awarded', university: 'IIT Bombay', area: 'Deep Learning for Medical Imaging', admissionYear: '2014', awardedYear: '2019', expectedYear: '' }
  },
  professionalDetails: {
    teachYears: '7',
    teachMonths: '3',
    indYears: '2',
    indMonths: '0',
    specializations: ['Machine Learning', 'Computer Vision'],
    researchAreas: ['Deep Learning', 'Medical Image Analysis'],
    skills: ['Python', 'PyTorch', 'TensorFlow', 'SQL'],
    bodies: ['IEEE', 'ACM'],
    otherBody: ''
  },
  publications: [
    {
      authors: ['Priya Sharma', 'A. Gupta', 'R. Desai'],
      title: 'Deep ensemble methods for retinal disease classification',
      type: 'Journal',
      source: 'IEEE Transactions on Medical Imaging',
      issn: '0278-0062',
      publisher: 'IEEE',
      venue: '',
      month: 'March',
      year: '2022',
      link: 'https://doi.org/10.1109/TMI.2022.XXXXXXX'
    }
  ]
};

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/faculty360';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const existing = await Faculty.findOne({ facultyId: SAMPLE.facultyId });
  if (existing) {
    console.log(`Sample record "${SAMPLE.facultyId}" already exists — skipping.`);
  } else {
    await Faculty.create(SAMPLE);
    console.log(`Created sample faculty record: ${SAMPLE.facultyId}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
