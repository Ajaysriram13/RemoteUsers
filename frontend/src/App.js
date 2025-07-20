import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import NotificationFeed from './components/NotificationFeed';
import NotificationForm from './components/NotificationForm';
import axios from 'axios';
import io from 'socket.io-client';

import './styles/main.css';
import Popup from './components/Popup'; // Import the new Popup component

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null); // State to hold the socket instance
  const [popupMessage, setPopupMessage] = useState(''); // State for popup message

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/users', {
            headers: { 'x-auth-token': token },
          });
          setUser(res.data);
          console.log('[FRONTEND] Logged in user data:', res.data);

          // Initialize and store socket instance
          const newSocket = io('https://remotemessagesender.onrender.com');
          setSocket(newSocket); // Store the socket instance
          console.log(`[FRONTEND] Emitting userConnected for user: ${res.data._id}`);
          newSocket.emit('userConnected', res.data._id);
          console.log('[FRONTEND] Socket listener for offlineUsersNotification being set up.');

          // Listen for offlineUsersNotification from backend
          newSocket.on('offlineUsersNotification', (data) => {
            console.log('[FRONTEND] Received offlineUsersNotification:', data);
            console.log('[FRONTEND] User role for check:', res.data.role);
            if (res.data && res.data.role === 'manager') {
              const offlineUsernames = data.offlineUsers.map(u => u.username).join(', ');
              setPopupMessage(`The following users are offline and will receive an email: ${offlineUsernames}`); // Set popup message
              console.log(`[FRONTEND] Displaying popup for offline users: ${offlineUsernames}`);
            } else {
              console.log('[FRONTEND] Not a manager, or user data not available. Not showing alert.');
            }
          });

        } catch (err) {
          console.error('[FRONTEND] Error fetching user or setting up socket:', err.response ? err.response.data : err.message);
          setToken(null);
          localStorage.removeItem('token');
          if (socket) {
            console.log('[FRONTEND] Disconnecting socket due to error.');
            socket.disconnect(); // Disconnect socket on error
          }
        }
      }
    };

    fetchUser();

    // Cleanup function for useEffect
    return () => {
      if (socket) {
        console.log('[FRONTEND] Cleaning up: Disconnecting socket.');
        socket.disconnect();
      }
    };
  }, [token]); // Removed 'socket' from dependency array to prevent infinite loop

  const handleSetToken = (token) => {
    console.log('[FRONTEND] Setting token:', token);
    setToken(token);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    console.log('[FRONTEND] Initiating logout.');
    if (socket && user) {
      console.log(`[FRONTEND] Emitting userDisconnected for user: ${user._id} and disconnecting socket.`);
      socket.emit('userDisconnected', user._id);
      socket.disconnect(); // Disconnect the socket
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    console.log('[FRONTEND] Token and user cleared from state and local storage.');
  };

  const handleClosePopup = () => {
    console.log('[FRONTEND] Closing popup.');
    setPopupMessage(''); // Clear popup message to close popup
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={handleSetToken} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            token ? (
              <div className="container">
                <button onClick={handleLogout}>Logout</button>
                {user && user.role === 'manager' && <NotificationForm token={token} />}
                <NotificationFeed token={token} user={user} />

                
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
      <Popup message={popupMessage} onClose={handleClosePopup} />
    </Router>
  );
};

export default App;
