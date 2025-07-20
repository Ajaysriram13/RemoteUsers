import React, { useState } from 'react';
import axios from 'axios';

const NotificationForm = ({ token }) => {
  const [formData, setFormData] = useState({
    message: '',
    priority: 'Normal',
  });

  const { message, priority } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/notifications', formData, {
        headers: { 'x-auth-token': token },
      });
      setFormData({ message: '', priority: 'Normal' });
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-container fade-in">
      <div className="form-group">
        <label htmlFor="message">Message</label>
        <input
          type="text"
          id="message"
          placeholder="Enter message"
          name="message"
          value={message}
          onChange={onChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="priority">Priority</label>
        <select id="priority" name="priority" value={priority} onChange={onChange}>
          <option value="Normal">Normal</option>
          <option value="High">High</option>
        </select>
      </div>
      <button type="submit">Send Notification</button>
    </form>
  );
};

export default NotificationForm;
