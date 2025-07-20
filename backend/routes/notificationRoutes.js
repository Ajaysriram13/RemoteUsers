const express = require('express');
const router = express.Router();
const { createNotification, getNotifications, updateNotification, deleteNotification } = require('../controllers/notificationController');
const { protect, authManager } = require('../middleware/authMiddleware');

module.exports = (io) => {
  router.route('/').post(authManager, (req, res) => createNotification(req, res, io)).get(protect, getNotifications);
  router.route('/:id').put(authManager, (req, res) => updateNotification(req, res, io)).delete(authManager, (req, res) => deleteNotification(req, res, io));
  return router;
};
