const Faculty = require('../models/Faculty');
const { overallCompletion, sectionScores } = require('../utils/completion');
const { buildHtml, buildCsv } = require('../utils/exportBuilders');

const fileStamp = (f) => {
  const p = f.personalDetails || {};
  const name = [p.firstName, p.lastName].filter(Boolean).join('_') || f.facultyId;
  return name.replace(/[^A-Za-z0-9_]/g, '') + '_faculty360_' + new Date().toISOString().slice(0, 10);
};

async function findOrCreate(facultyId) {
  let doc = await Faculty.findOne({ facultyId });
  if (!doc) doc = await Faculty.create({ facultyId });
  return doc;
}

/* GET /api/faculty/:facultyId */
exports.getProfile = async (req, res, next) => {
  try {
    const doc = await findOrCreate(req.params.facultyId);
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
    delete payload.status;
    delete payload.submittedAt;

    payload.completion = overallCompletion({ ...payload, notApplicable: payload.notApplicable || {} });

    const doc = await Faculty.findOneAndUpdate(
      { facultyId: req.params.facultyId },
      { $set: payload },
      { new: true, upsert: true, runValidators: false, setDefaultsOnInsert: true }
    );

    res.json({ profile: doc, savedAt: new Date().toISOString(), completion: doc.completion });
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
    doc.referenceNo = `FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await doc.save();
    res.json({ profile: doc, referenceNo: doc.referenceNo, submittedAt: doc.submittedAt });
  } catch (err) {
    next(err);
  }
};

/* POST /api/faculty/:facultyId/reopen */
exports.reopenProfile = async (req, res, next) => {
  try {
    const doc = await Faculty.findOneAndUpdate(
      { facultyId: req.params.facultyId },
      { $set: { status: 'draft' } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Profile not found' });
    res.json({ profile: doc });
  } catch (err) {
    next(err);
  }
};

/* GET /api/faculty — list for the department dashboard */
exports.listProfiles = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.department) filter['personalDetails.department'] = req.query.department;
    if (req.query.status) filter.status = req.query.status;

    const docs = await Faculty.find(filter)
      .select('facultyId status completion personalDetails.firstName personalDetails.lastName personalDetails.department personalDetails.designation updatedAt')
      .sort({ updatedAt: -1 })
      .limit(200);

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
