import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import '../styles/screens.css';

const API_URL = 'http://localhost:8000';

function LoginScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    age: '',
    gender: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      const { access_token } = response.data;
      onLogin({ email: formData.email }, access_token);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone: formData.phone,
        age: parseInt(formData.age),
        gender: formData.gender
      });

      alert('Registration successful! Please login.');
      setIsLogin(true);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        age: '',
        gender: ''
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="auth-card">
        {/* Logo */}
        <motion.div 
          className="logo"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="logo-circle">🚑</div>
        </motion.div>

        <h1>MediAlert</h1>
        <p className="subtitle">Emergency Medical Help</p>

        {/* Form */}
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required={!isLogin}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required={!isLogin}
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                required={!isLogin}
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required={!isLogin}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
          </motion.button>
        </form>

        {/* Toggle */}
        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="toggle-btn"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </motion.div>
  );
}

export default LoginScreen;