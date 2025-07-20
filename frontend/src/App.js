import React, { useState, useEffect, useRef } from 'react';
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
  const socketRef = useRef(null); // Use useRef to hold the socket instance
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

          // Initialize and store socket instance
          const newSocket = io('https://remotemessagesender.onrender.com');
          socketRef.current = newSocket; // Store the socket instance
          socketRef.current.emit('userConnected', res.data._id);
          // Listen for offlineUsersNotification from backend
          socketRef.current.on('offlineUsersNotification', (data) => {
            if (res.data && res.data.role === 'manager') {
              const offlineUsernames = data.offlineUsers.map(u => u.username).join(', ');
              setPopupMessage(`The following users are offline and will receive an email: ${offlineUsernames}`); // Set popup message
            } else {

            }
          });

        } catch (err) {
          console.error('[FRONTEND] Error fetching user or setting up socket:', err.response ? err.response.data : err.message);
          setToken(null);
          localStorage.removeItem('token');
          if (socketRef.current) {
            console.log('[FRONTEND] Disconnecting socket due to error.');
            socketRef.current.disconnect(); // Disconnect socket on error
          }
        }
      }
    };

    fetchUser();

    // Cleanup function for useEffect
    return () => {
      if (socketRef.current) {
        console.log('[FRONTEND] Cleaning up: Disconnecting socket.');
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  const handleSetToken = (token) => {
    console.log('[FRONTEND] Setting token:', token);
    setToken(token);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    console.log('[FRONTEND] Initiating logout.');
    if (socketRef.current && user) {
      console.log(`[FRONTEND] Emitting userDisconnected for user: ${user._id} and disconnecting socket.`);
      socketRef.current.emit('userDisconnected', user._id);
      socketRef.current.disconnect(); // Disconnect the socket
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
