const Notification = require('../models/Notification');
const User = require('../models/User');



const createNotification = async (req, res, io) => {
  const { message, priority } = req.body;
  const sender = req.user.id;

  try {
    console.log('New notification request:', { message, priority, sender });

    const newNotification = new Notification({
      message,
      priority,
      sender,
    });

    const notification = await newNotification.save();
    io.emit('newNotification', notification);

    if (priority === 'High') {
      console.log('--- DATABASE DEBUG: FETCHING ALL USERS ---');
      const allUsersFromDB = await User.find({});
      console.log('--- DATABASE DEBUG: RAW USER DATA ---', JSON.stringify(allUsersFromDB, null, 2));

      const connectedUsers = req.app.get('connectedUsers');
      console.log('[NOTIF] Connected users map:', connectedUsers);

      const allUsers = await User.find({});
      console.log('[NOTIF] All users from DB:', allUsers.map(u => ({ id: u._id, username: u.username, role: u.role })));

      const managerSocketId = connectedUsers[req.user.id];

      const offlineUsers = allUsers.filter(user => {
        const isOffline = !connectedUsers[user._id.toString()];
        console.log(`[NOTIF] Checking user ${user.username} (${user._id}): isOffline = ${isOffline}`);
        return isOffline;
      });

      console.log('[NOTIF] Final offline users:', offlineUsers.map(u => ({ id: u._id, username: u.username })));

      console.log('[NOTIF] Manager Socket ID:', managerSocketId);
      console.log(offlineUsers,'this2')

      if (offlineUsers.length > 0) {
        console.log(`[NOTIF] Attempting to emit offlineUsersNotification to manager socket ID: ${managerSocketId}`);
        io.to(managerSocketId).emit('offlineUsersNotification', {
          offlineUsers: offlineUsers.map(User => ({ username: User.username })),
          messageSent: message,
        });
      }
    }   

    res.json(notification);
  } catch (err) {
    console.error('Error creating notification:', err.message);
    res.status(500).send('Server error');
  }
};

const getNotifications = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'manager') {
      query = { sender: req.user.id }; // Managers see only their own sent notifications
    }
    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const updateNotification = async (req, res, io) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Ensure user is the sender
    if (notification.sender.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    io.emit('notificationUpdated', notification);

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const deleteNotification = async (req, res, io) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Ensure user is the sender
    if (notification.sender.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    io.emit('notificationDeleted', req.params.id);

    res.json({ msg: 'Notification removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { createNotification, getNotifications, updateNotification, deleteNotification };