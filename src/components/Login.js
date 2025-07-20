import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

const Login = ({ setToken }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState(null);

  const { username, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      const res = await axios.post('/api/users/login', formData);
      if (res && res.data && res.data.token) {
        setToken(res.data.token);
        navigate('/');
      } else {
        setError('Login failed: No token received.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else if (err.message) {
        setError('Login error: ' + err.message);
      } else {
        setError('An unknown login error occurred.');
      }
      console.error('Login error:', err);
    }
  };

  return (
    <div className="centered-form-container">
      <form onSubmit={onSubmit} className="form-container fade-in">
        <h2>Login</h2>
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
        <button type="submit">Login</button>
        <p className="link-text">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
