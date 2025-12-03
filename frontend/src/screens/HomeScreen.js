import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import '../App.css';

const API_URL = 'http://localhost:8000';

function HomeScreen({ user, onStartAssessment, onLogout, onOpenHospitalMap, onOpenDoctorBooking }) {
  const [userProfile, setUserProfile] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [emergencyNumbers, setEmergencyNumbers] = useState({});

  useEffect(() => {
    // Load user profile and data
    if (user) {
      setUserProfile(user);
      loadEmergencyNumbers();
      loadRecentActivity();
    }
  }, [user]);

  const loadEmergencyNumbers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/emergency-numbers/NG`);
      setEmergencyNumbers(response.data.emergency_numbers || {});
    } catch (err) {
      console.error('Failed to load emergency numbers:', err);
    }
  };

  const loadRecentActivity = async () => {
    // Mock recent activity - in production, fetch from your API
    setRecentActivity([
      {
        id: 1,
        type: 'assessment',
        description: 'Fever checked - Yellow Alert',
        date: '2 days ago',
        icon: '🔔'
      },
      {
        id: 2,
        type: 'consultation',
        description: 'Consultation with Dr. Smith',
        date: '5 days ago',
        icon: '👨‍⚕️'
      }
    ]);
  };

  const handleEmergencyCall = () => {
    const ambulanceNumber = emergencyNumbers.ambulance || '112';
    window.location.href = `tel:${ambulanceNumber}`;
  };

  return (
    <motion.div
      className="home-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="home-header">
        <div>
          <h1>🏥 MediAlert</h1>
          <p style={{ color: '#00D9FF', margin: '5px 0 0 0' }}>
            Welcome, {userProfile?.email || 'User'}
          </p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Emergency Quick Access */}
      <motion.div
        className="action-card"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 71, 87, 0.2), rgba(255, 71, 87, 0.1))',
          border: '2px solid #FF4757',
          marginBottom: '30px',
          cursor: 'pointer'
        }}
        onClick={handleEmergencyCall}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="action-card-icon">🚨</div>
        <h3 style={{ color: '#FF4757' }}>Medical Emergency?</h3>
        <p>TAP FOR EMERGENCY - Call ambulance for instant help</p>
        <p style={{ color: '#FF4757', fontWeight: 700, marginTop: '10px' }}>
          {emergencyNumbers.ambulance || '112'}
        </p>
      </motion.div>

      {/* Main Action Cards */}
      <div className="home-content">
        {/* Assessment Card */}
        <motion.div
          className="action-card"
          onClick={onStartAssessment}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="action-card-icon">🩺</div>
          <h3>Medical Assessment</h3>
          <p>Quick symptom assessment powered by AI to determine severity level</p>
          <button>Start Assessment</button>
        </motion.div>

        {/* Hospital Finder Card */}
        <motion.div
          className="action-card"
          onClick={onOpenHospitalMap}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="action-card-icon">🏥</div>
          <h3>Nearest Hospital</h3>
          <p>Find the closest hospital with real-time location and distance</p>
          <button>Find Hospital</button>
        </motion.div>

        {/* Doctor Booking Card */}
        <motion.div
          className="action-card"
          onClick={onOpenDoctorBooking}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="action-card-icon">👨‍⚕️</div>
          <h3>Book a Doctor</h3>
          <p>Schedule a consultation with qualified doctors online</p>
          <button>Book Doctor</button>
        </motion.div>
      </div>

      {/* Health Summary Section */}
      <motion.div
        style={{
          marginTop: '50px',
          background: 'rgba(22, 35, 57, 0.9)',
          border: '1px solid rgba(0, 217, 255, 0.3)',
          borderRadius: '15px',
          padding: '30px',
          maxWidth: '1200px',
          margin: '50px auto 0'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 style={{ color: '#fff', marginBottom: '30px', fontSize: '24px' }}>
          📋 Health Summary
        </h2>

        {/* Health Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}
        >
          {/* Last Check-up */}
          <div
            style={{
              background: 'rgba(0, 217, 255, 0.1)',
              border: '1px solid rgba(0, 217, 255, 0.3)',
              borderRadius: '12px',
              padding: '20px'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>📅</div>
            <h4 style={{ color: '#00D9FF', margin: '0 0 8px 0' }}>Last Check-up</h4>
            <p style={{ color: '#fff', margin: '0', fontWeight: 700 }}>3 days ago</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: '5px 0 0 0', fontSize: '13px' }}>
              Fever assessment
            </p>
          </div>

          {/* Medications */}
          <div
            style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '12px',
              padding: '20px'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>💊</div>
            <h4 style={{ color: '#FFC107', margin: '0 0 8px 0' }}>Medications</h4>
            <p style={{ color: '#fff', margin: '0', fontWeight: 700 }}>2 active</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: '5px 0 0 0', fontSize: '13px' }}>
              Paracetamol, Vitamin D
            </p>
          </div>

          {/* Emergency Contacts */}
          <div
            style={{
              background: 'rgba(46, 213, 115, 0.1)',
              border: '1px solid rgba(46, 213, 115, 0.3)',
              borderRadius: '12px',
              padding: '20px'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>📞</div>
            <h4 style={{ color: '#2ED573', margin: '0 0 8px 0' }}>Emergency Contacts</h4>
            <p style={{ color: '#fff', margin: '0', fontWeight: 700 }}>4 saved</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: '5px 0 0 0', fontSize: '13px' }}>
              Updated today
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 style={{ color: '#fff', marginBottom: '20px' }}>Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}
            >
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    background: 'rgba(0, 217, 255, 0.05)',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '15px',
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ fontSize: '24px' }}>{activity.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#fff', margin: '0 0 5px 0', fontWeight: 600 }}>
                      {activity.description}
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0, fontSize: '13px' }}>
                      {activity.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No recent activity</p>
          )}
          <a
            href="#"
            style={{
              color: '#00D9FF',
              textDecoration: 'none',
              fontWeight: 700,
              marginTop: '15px',
              display: 'block'
            }}
          >
            View All History →
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default HomeScreen;