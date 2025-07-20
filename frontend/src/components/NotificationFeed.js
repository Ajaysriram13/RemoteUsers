import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const NotificationFeed = ({ token, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const [editPriority, setEditPriority] = useState('Normal');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('/api/notifications', {
          headers: { 'x-auth-token': token },
        });
        setNotifications(res.data);
        console.log('Fetched notifications:', res.data);
      } catch (err) {
        console.error(err.response.data);
      }
    };

    fetchNotifications();

    const socket = io('https://remotemessagesender.onrender.com');
    socket.on('newNotification', (notification) => {
      // Managers now see their own sent notifications
      if (user && (user.role !== 'manager' || notification.sender === user._id)) {
        setNotifications((prevNotifications) => [
          notification,
          ...prevNotifications,
        ]);
      }
    });

    socket.on('notificationUpdated', (updatedNotification) => {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === updatedNotification._id ? updatedNotification : notif
        )
      );
    });

    socket.on('notificationDeleted', (deletedNotificationId) => {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif._id !== deletedNotificationId)
      );
    });

    return () => socket.disconnect();
  }, [token, user]);

  const handleEditClick = (notification) => {
    setEditingId(notification._id);
    setEditMessage(notification.message);
    setEditPriority(notification.priority);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(
        `/api/notifications/${id}`,
        { message: editMessage, priority: editPriority },
        {
          headers: { 'x-auth-token': token },
        }
      );
      setEditingId(null);
      setEditMessage('');
      setEditPriority('Normal');
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`, {
        headers: { 'x-auth-token': token },
      });
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <div className="notification-feed">
      <h2>Notification Feed</h2>
      {notifications.map((notification) => (
        <div key={notification._id} className={`notification-item fade-in ${notification.priority === 'High' ? 'high-priority' : 'low-priority'}`}>
          {editingId === notification._id ? (
            <div className="edit-form">
              <input
                type="text"
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
              />
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
              <button onClick={() => handleUpdate(notification._id)}>Update</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          ) : (
            <div>
              <p>
                {notification.message} - <strong>{notification.priority}</strong>
              </p>
              {user && user.role === 'manager' && notification.sender === user._id && (
                <div className="actions">
                  <button onClick={() => handleEditClick(notification)} className="edit-button">Edit</button>
                  <button onClick={() => handleDelete(notification._id)} className="delete-button">Delete</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationFeed;
