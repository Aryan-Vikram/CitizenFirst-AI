const asyncHandler = require('../utils/asyncHandler');
const store = require('../data/store');

const listNotifications = asyncHandler(async (req, res) => {
  res.json({ notifications: store.getNotifications() });
});

const markRead = asyncHandler(async (req, res) => {
  const n = store.markNotificationRead(req.params.id);
  if (!n) return res.status(404).json({ error: 'Notification not found.' });
  res.json({ notification: n });
});

module.exports = { listNotifications, markRead };
