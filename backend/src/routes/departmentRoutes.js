const express = require('express');
const { listDepartments, departmentWorkload } = require('../controllers/departmentController');

const router = express.Router();

router.get('/', listDepartments);
router.get('/:code/workload', departmentWorkload);

module.exports = router;
