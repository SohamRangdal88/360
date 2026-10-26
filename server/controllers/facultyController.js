const Faculty = require('../models/Faculty');
const mongoose = require('mongoose');
const { overallCompletion, sectionScores } = require('../utils/completion');
const { buildHtml, buildCsv } = require('../utils/exportBuilders');
const { getAdmin } = require('../config/admins');

const memoryStore = new Map();

const fileStamp = (f) => {
  const p = f.personalDetails || {};
  const name = [p.firstName, p.lastName].filter(Boolean).join('_') || f.facultyId;
  return name.replace(/[^A-Za-z0-9_]/g, '') + '_faculty360_' + new Date().toISOString().slice(0, 10);
};

const isDbConnected = () => mongoose.connection.readyState === 1;

function requireAdmin(req, res) {
  const admin = getAdmin(req.get('x-admin-email'));
  if (!admin) {
    res.status(403).json({ message: 'A configured administrator account is required.' });
    return null;
  }
  return admin;
}

function adminFilter(req, admin) {
  const query = req.query || {};
  const filter = {};
  if (admin.role === 'department') {
    filter['personalDetails.department'] = admin.department;
  } else if (query.department) {
    filter['personalDetails.department'] = query.department;
  }
  if (query.status) filter.status = query.status;
  if (query.designation) filter['personalDetails.designation'] = query.designation;
  if (query.gender) filter['personalDetails.gender'] = query.gender;
  if (query.bloodGroup) filter['personalDetails.bloodGroup'] = query.bloodGroup;
  if (query.highestQualification) filter['qualifications.highest'] = query.highestQualification;
  if (query.phdStatus) filter['qualifications.phd.status'] = query.phdStatus;
  if (query.publicationType) filter['publications.type'] = query.publicationType;
  if (query.patentStatus) filter['patents.status'] = query.patentStatus;
  if (query.awardCategory) filter['awards.category'] = query.awardCategory;
  if (query.awardLevel) filter['awards.level'] = query.awardLevel;
  if (query.projectType) filter['projects.type'] = query.projectType;
  if (query.projectStatus) filter['projects.status'] = query.projectStatus;
  return filter;
}

function facultyIdForEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) hash = ((hash << 5) - hash + normalized.charCodeAt(i)) | 0;
  return `FAC-${new Date().getFullYear()}-${Math.abs(hash).toString(36).slice(0, 8).toUpperCase()}`;
}

async function findOrCreate(facultyId) {
  if (isDbConnected()) {
    let doc = await Faculty.findOne({ facultyId });
    if (!doc) doc = await Faculty.create({ facultyId });
    return doc;
  }
  
  if (!memoryStore.has(facultyId)) {
    memoryStore.set(facultyId, {
      facultyId,
      status: 'draft',
      completion: 0,
      personalDetails: { firstName: '', lastName: '', officialEmail: '' },
      contactDetails: {},
      qualifications: { highest: '', ug: {}, pg: {}, phd: {} },
      professionalDetails: {},
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
    });
  }
  return memoryStore.get(facultyId);
}

/* GET /api/faculty/:facultyId */
exports.getProfile = async (req, res, next) => {
  try {
    const doc = await findOrCreate(req.params.facultyId);
    const admin = getAdmin(req.get('x-admin-email'));
    if (req.get('x-admin-email') && !admin) return res.status(403).json({ message: 'A configured administrator account is required.' });
    if (admin?.role === 'department' &&
        doc.personalDetails?.department &&
        doc.personalDetails.department !== admin.department) {
      return res.status(403).json({ message: 'This administrator can only view faculty in the assigned department.' });
    }
    res.json({ profile: doc, sectionScores: sectionScores(doc) });
  } catch (err) {
    next(err);
  }
};

/* GET /api/faculty/account/:email */
exports.getProfileByEmail = async (req, res, next) => {
  try {
    const email = decodeURIComponent(req.params.email).trim().toLowerCase();
    const facultyId = facultyIdForEmail(email);
    const doc = await findOrCreate(facultyId);
    if (!doc.personalDetails.officialEmail) {
      doc.personalDetails.officialEmail = email;
      if (isDbConnected()) await doc.save();
      else memoryStore.set(facultyId, doc);
    }
    res.json({ profile: doc, sectionScores: sectionScores(doc) });
  } catch (err) {
    next(err);
  }
};

/* PUT /api/faculty/:facultyId  — saves the whole draft */
exports.saveProfile = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    delete payload._id;
    delete payload.facultyId;

    payload.completion = overallCompletion({ ...payload, notApplicable: payload.notApplicable || {} });

    if (isDbConnected()) {
      const doc = await Faculty.findOneAndUpdate(
        { facultyId: req.params.facultyId },
        { $set: payload },
        { new: true, upsert: true, runValidators: false, setDefaultsOnInsert: true }
      );
      return res.json({ profile: doc, savedAt: new Date().toISOString(), completion: doc.completion });
    }

    const current = memoryStore.get(req.params.facultyId) || { facultyId: req.params.facultyId };
    const updated = { ...current, ...payload };
    memoryStore.set(req.params.facultyId, updated);
    res.json({ profile: updated, savedAt: new Date().toISOString(), completion: updated.completion });
  } catch (err) {
    next(err);
  }
};

/* PATCH /api/faculty/:facultyId/section/:section — saves one section only */
exports.saveSection = async (req, res, next) => {
  try {
    const { section } = req.params;
    const allowed = [
      'personalDetails', 'contactDetails', 'qualifications', 'professionalDetails',
      'industryTrainings', 'programs', 'publications', 'patents', 'awards',
      'financialSupport', 'projects', 'nptelCourses', 'otherCourses', 'notApplicable'
    ];
    if (!allowed.includes(section)) {
      return res.status(400).json({ message: `Unknown section: ${section}` });
    }

    const doc = await findOrCreate(req.params.facultyId);
    doc[section] = req.body.data;
    doc.completion = overallCompletion(doc);
    await doc.save();

    res.json({ profile: doc, completion: doc.completion, savedAt: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
};

/* POST /api/faculty/:facultyId/submit */
exports.submitProfile = async (req, res, next) => {
  try {
    const doc = await findOrCreate(req.params.facultyId);
    doc.completion = overallCompletion(doc);
    doc.status = 'submitted';
    doc.submittedAt = new Date();
    doc.referenceNo = doc.referenceNo || `FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (isDbConnected() && typeof doc.save === 'function') {
      await doc.save();
    } else {
      memoryStore.set(req.params.facultyId, doc);
    }
    
    res.json({ profile: doc, referenceNo: doc.referenceNo, submittedAt: doc.submittedAt });
  } catch (err) {
    next(err);
  }
};

/* POST /api/faculty/:facultyId/reopen */
exports.reopenProfile = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const doc = await Faculty.findOneAndUpdate(
        { facultyId: req.params.facultyId },
        { $set: { status: 'draft' } },
        { new: true }
      );
      if (!doc) return res.status(404).json({ message: 'Profile not found' });
      return res.json({ profile: doc });
    }

    const doc = memoryStore.get(req.params.facultyId);
    if (doc) {
      doc.status = 'draft';
      memoryStore.set(req.params.facultyId, doc);
    }
    res.json({ profile: doc || { facultyId: req.params.facultyId, status: 'draft' } });
  } catch (err) {
    next(err);
  }
};

/* POST /api/faculty/:facultyId/approve */
exports.approveProfile = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const doc = await Faculty.findOneAndUpdate(
        { facultyId: req.params.facultyId },
        { $set: { status: 'approved' } },
        { new: true }
      );
      if (!doc) return res.status(404).json({ message: 'Profile not found' });
      return res.json({ profile: doc });
    }

    const doc = memoryStore.get(req.params.facultyId);
    if (!doc) return res.status(404).json({ message: 'Profile not found' });
    doc.status = 'approved';
    memoryStore.set(req.params.facultyId, doc);
    res.json({ profile: doc });
  } catch (err) {
    next(err);
  }
};

/* POST /api/faculty/:facultyId/return */
exports.returnProfile = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const doc = await Faculty.findOneAndUpdate(
        { facultyId: req.params.facultyId },
        { $set: { status: 'returned' } },
        { new: true }
      );
      if (!doc) return res.status(404).json({ message: 'Profile not found' });
      return res.json({ profile: doc });
    }

    const doc = memoryStore.get(req.params.facultyId);
    if (!doc) return res.status(404).json({ message: 'Profile not found' });
    doc.status = 'returned';
    memoryStore.set(req.params.facultyId, doc);
    res.json({ profile: doc });
  } catch (err) {
    next(err);
  }
};

/* GET /api/faculty — list for the department dashboard */
exports.listProfiles = async (req, res, next) => {
  try {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const filter = adminFilter(req, admin);

    let docs = isDbConnected()
      ? await Faculty.find(filter)
        .select('facultyId status completion personalDetails.firstName personalDetails.lastName personalDetails.department personalDetails.designation personalDetails.officialEmail updatedAt')
        .sort({ updatedAt: -1 })
        .limit(200)
      : Array.from(memoryStore.values()).filter((doc) => {
        if (filter.status && doc.status !== filter.status) return false;
        if (filter['personalDetails.department'] &&
            doc.personalDetails?.department !== filter['personalDetails.department']) return false;
        if (filter['personalDetails.designation'] && doc.personalDetails?.designation !== filter['personalDetails.designation']) return false;
        if (filter['personalDetails.gender'] && doc.personalDetails?.gender !== filter['personalDetails.gender']) return false;
        return true;
      });

    if (req.query.minCompletion) docs = docs.filter((doc) => Number(doc.completion || 0) >= Number(req.query.minCompletion));
    if (req.query.maxCompletion) docs = docs.filter((doc) => Number(doc.completion || 0) <= Number(req.query.maxCompletion));
    res.json({ count: docs.length, profiles: docs });
  } catch (err) {
    next(err);
  }
};

/* ---------------- downloads ---------------- */

/* GET /api/faculty/:facultyId/export/json */
exports.exportJson = async (req, res, next) => {
  try {
    const doc = await Faculty.findOne({ facultyId: req.params.facultyId }).lean();
    if (!doc) return res.status(404).json({ message: 'Profile not found' });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileStamp(doc)}.json"`);
    res.send(JSON.stringify(doc, null, 2));
  } catch (err) {
    next(err);
  }
};

/* GET /api/faculty/:facultyId/export/html?print=1 */
exports.exportHtml = async (req, res, next) => {
  try {
    const doc = await Faculty.findOne({ facultyId: req.params.facultyId }).lean();
    if (!doc) return res.status(404).json({ message: 'Profile not found' });

    const html = buildHtml(doc);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (req.query.download === '1') {
      res.setHeader('Content-Disposition', `attachment; filename="${fileStamp(doc)}.html"`);
    }
    res.send(html);
  } catch (err) {
    next(err);
  }
};

/* GET /api/faculty/:facultyId/export/csv */
exports.exportCsv = async (req, res, next) => {
  try {
    const doc = await Faculty.findOne({ facultyId: req.params.facultyId }).lean();
    if (!doc) return res.status(404).json({ message: 'Profile not found' });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileStamp(doc)}.csv"`);
    res.send('\uFEFF' + buildCsv(doc));
  } catch (err) {
    next(err);
  }
};
