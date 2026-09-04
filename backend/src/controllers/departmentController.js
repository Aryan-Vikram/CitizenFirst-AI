const asyncHandler = require('../utils/asyncHandler');
const store = require('../data/store');

// GET /api/departments — used by Interoperability Hub connector cards.
const listDepartments = asyncHandler(async (req, res) => {
  const departments = store.getDepartments().map((d) => ({
    ...d,
    activeCases: store.getCases({ department: d.code }).filter((c) => c.status !== 'Resolved').length
  }));
  res.json({ departments, notice: 'Connection status reflects simulated integrations for this prototype.' });
});

// GET /api/departments/:code/workload — Department Dashboard priority table.
const departmentWorkload = asyncHandler(async (req, res) => {
  const workload = store.getDepartmentWorkload(req.params.code.toUpperCase());
  if (!workload.total && !store.getDepartments().some((d) => d.code === req.params.code.toUpperCase())) {
    return res.status(404).json({ error: 'Unknown department code.' });
  }
  res.json(workload);
});

module.exports = { listDepartments, departmentWorkload };
