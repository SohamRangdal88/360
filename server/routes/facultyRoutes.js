const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/facultyController');

router.get('/', ctrl.listProfiles);
router.get('/account/:email', ctrl.getProfileByEmail);
router.get('/:facultyId', ctrl.getProfile);
router.put('/:facultyId', ctrl.saveProfile);
router.patch('/:facultyId/section/:section', ctrl.saveSection);
router.post('/:facultyId/submit', ctrl.submitProfile);
router.post('/:facultyId/reopen', ctrl.reopenProfile);
router.post('/:facultyId/approve', ctrl.approveProfile);
router.post('/:facultyId/return', ctrl.returnProfile);

router.get('/:facultyId/export/json', ctrl.exportJson);
router.get('/:facultyId/export/html', ctrl.exportHtml);
router.get('/:facultyId/export/csv', ctrl.exportCsv);

module.exports = router;
