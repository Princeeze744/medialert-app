import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import '../styles/screens.css';

const API_URL = 'http://localhost:8000';

function DoctorBooking({ onBack }) {
  const [step, setStep] = useState(1); // 1: Browse, 2: Select Date/Time, 3: Confirm, 4: Success
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [error, setError] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Fetch available doctors
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/doctors/available`);
      setDoctors(response.data.doctors || []);
    } catch (err) {
      setError('Failed to load doctors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);

    try {
      const response = await axios.get(
        `${API_URL}/api/doctors/slots/${selectedDoctor.id}?date=${date}`
      );
      setAvailableSlots(response.data.available_slots || []);
    } catch (err) {
      console.error('Failed to load slots:', err);
    }
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select date and time');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/doctors/book`,
        {
          doctor_id: selectedDoctor.id,
          booking_date: selectedDate,
          booking_time: selectedTime,
          symptoms: [],
          notes: ''
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBookingDetails(response.data);
      setStep(4); // Success screen
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleBackStep = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  const handleStartNewBooking = () => {
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
    setStep(1);
  };

  if (loading) {
    return (
      <div className="doctor-container loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '60px' }}
        >
          🩺
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="doctor-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="doctor-header">
        <button
          onClick={handleBackStep}
          style={{
            background: 'none',
            border: 'none',
            color: '#00D9FF',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <h1>Book a Doctor</h1>
        <div></div>
      </div>

      {/* Booking Steps Indicator */}
      <div className="booking-steps">
        {['Browse', 'Schedule', 'Confirm', 'Success'].map((label, index) => (
          <React.Fragment key={index}>
            <div className={`step ${step > index ? 'active' : ''}`}>
              <div className="step-number">{index + 1}</div>
              <p>{label}</p>
            </div>
            {index < 3 && <div className="step-line"></div>}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Browse Doctors */}
      {step === 1 && (
        <motion.div
          className="booking-step-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="doctors-grid">
            {doctors.length === 0 ? (
              <div className="no-results">
                <p>No doctors available</p>
                <button onClick={fetchDoctors} className="retry-btn">
                  Retry
                </button>
              </div>
            ) : (
              doctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  className="doctor-card"
                  onClick={() => handleSelectDoctor(doctor)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {doctor.available && (
                    <div className="online-badge">🟢 Available</div>
                  )}
                  <div className="doctor-avatar">
                    <div className="avatar-icon">👨‍⚕️</div>
                  </div>
                  <h3>{doctor.name}</h3>
                  <p className="specialty">{doctor.specialty}</p>
                  <div className="doctor-stats">
                    <div className="rating">
                      <span className="stars">⭐ {doctor.rating}</span>
                      <span className="reviews">(150 reviews)</span>
                    </div>
                  </div>
                  <p className="experience">
                    💼 {doctor.experience_years} years experience
                  </p>
                  <div className="doctor-meta">
                    <div className="fee">
                      <span className="label">Consultation Fee</span>
                      <span className="price">₦2,500</span>
                    </div>
                    <div className="response">
                      <span className="label">Response Time</span>
                      <span className="time">~5 min</span>
                    </div>
                  </div>
                  <button className="btn-book-now">Select Doctor</button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && selectedDoctor && (
        <motion.div
          className="booking-step-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="doctor-summary">
            <div className="summary-avatar">👨‍⚕️</div>
            <div className="summary-info">
              <h3>{selectedDoctor.name}</h3>
              <p>{selectedDoctor.specialty}</p>
              <p>⭐ {selectedDoctor.rating}</p>
            </div>
            <div className="summary-fee">
              <span className="fee-label">Fee</span>
              <span className="fee-value">₦2,500</span>
            </div>
          </div>

          <div className="date-selection">
            <label>Select Date</label>
            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {availableSlots.length > 0 && (
            <div className="time-selection">
              <label>Select Time</label>
              <div className="time-slots">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                    onClick={() => handleSelectTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button className="btn-back" onClick={handleBackStep}>
              Back
            </button>
            <button
              className="btn-confirm"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(3)}
            >
              Continue
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Confirm Booking */}
      {step === 3 && selectedDoctor && (
        <motion.div
          className="booking-step-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="doctor-summary">
            <div className="summary-avatar">👨‍⚕️</div>
            <div className="summary-info">
              <h3>{selectedDoctor.name}</h3>
              <p>{selectedDoctor.specialty}</p>
            </div>
          </div>

          <div className="booking-details">
            <div className="detail-card">
              <span className="detail-label">Date</span>
              <span className="detail-value">{selectedDate}</span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Time</span>
              <span className="detail-value">{selectedTime}</span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Fee</span>
              <span className="detail-value">₦2,500</span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Duration</span>
              <span className="detail-value">30 minutes</span>
            </div>
          </div>

          <div className="instructions-box">
            <h4>📋 Before Your Consultation</h4>
            <p>✓ Ensure you have a stable internet connection</p>
            <p>✓ Find a quiet, private space</p>
            <p>✓ Have your medical history ready</p>
            <p className="reminder">
              ⏰ Reminder: You'll receive a notification 10 minutes before the session
            </p>
          </div>

          <div className="action-buttons">
            <button className="btn-back" onClick={() => setStep(2)}>
              Back
            </button>
            <button className="btn-confirm" onClick={handleConfirmBooking}>
              Confirm Booking
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Success */}
      {step === 4 && bookingDetails && (
        <motion.div
          className="booking-step-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="success-badge">✓</div>
          <h2 className="success-title">Booking Confirmed!</h2>

          <div className="booking-details">
            <div className="detail-card">
              <span className="detail-label">Doctor</span>
              <span className="detail-value">{selectedDoctor.name}</span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Date</span>
              <span className="detail-value">{selectedDate}</span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Time</span>
              <span className="detail-value">{selectedTime}</span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Consultation ID</span>
              <span className="detail-value">#{bookingDetails.consultation_id}</span>
            </div>
          </div>

          <div className="instructions-box">
            <h4>📧 Next Steps</h4>
            <p>✓ Confirmation sent to your email</p>
            <p>✓ Download the MediAlert app for video consultation</p>
            <p>✓ Join 5 minutes before your appointment</p>
          </div>

          <div className="action-buttons">
            <button
              className="btn-back-home"
              onClick={() => {
                handleStartNewBooking();
                onBack();
              }}
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}
    </motion.div>
  );
}

export default DoctorBooking;