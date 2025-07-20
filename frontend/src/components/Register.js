import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'User',
  });
  const [error, setError] = useState(null);

  const { username, password, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      const res = await axios.post('/api/users/register', formData);
      // On successful registration, redirect to login page
      alert(res.data.msg); // Show success message
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else if (err.message) {
        setError('Registration error: ' + err.message);
      } else {
        setError('An unknown registration error occurred.');
      }
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="centered-form-container">
      <form onSubmit={onSubmit} className="form-container fade-in">
        <h2>Register</h2>
        {error && <div className="error-popup fade-in">{error}</div>}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            name="username"
            value={username}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={role} onChange={onChange}>
            <option value="User">User</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
        <button type="submit">Register</button>
        <p className="link-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
