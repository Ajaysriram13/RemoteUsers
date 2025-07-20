import React from 'react';
import '../../src/styles/main.css'; // Assuming main.css has general modal styles

const Popup = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>{message}</p>
        <button onClick={onClose} className="popup-close-btn">Close</button>
      </div>
    </div>
  );
};

export default Popup;
