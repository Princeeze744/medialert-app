import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import '../App.css';

const API_URL = 'http://localhost:8000';

function HospitalMap({ onBack }) {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/hospitals/real/nearby?latitude=4.8156&longitude=6.9271&radius_km=15`
      );
      setHospitals(response.data.hospitals || []);
      setFilteredHospitals(response.data.hospitals || []);
      setError('');
    } catch (err) {
      setError('Failed to load hospitals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredHospitals(hospitals);
    } else {
      const filtered = hospitals.filter(h =>
        h.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredHospitals(filtered);
    }
  };

  const getHospitalTypeIcon = (name) => {
    if (name.includes('Teaching') || name.includes('University')) return '🏫';
    if (name.includes('Clinic')) return '⚕️';
    if (name.includes('Private')) return '🏥';
    return '🏥';
  };

  const getHospitalTypeColor = (name) => {
    if (name.includes('Teaching') || name.includes('University')) return 'rgba(138, 43, 226, 0.15)';
    if (name.includes('Clinic')) return 'rgba(0, 150, 136, 0.15)';
    if (name.includes('Private')) return 'rgba(255, 152, 0, 0.15)';
    return 'rgba(0, 217, 255, 0.15)';
  };

  const getHospitalTypeBorder = (name) => {
    if (name.includes('Teaching') || name.includes('University')) return '#8A2BE2';
    if (name.includes('Clinic')) return '#009688';
    if (name.includes('Private')) return '#FF9800';
    return '#00D9FF';
  };

  return (
    <motion.div
      className="hospital-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="hospital-header">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>
        <h1>🏥 Find Hospitals</h1>
        <div></div>
      </div>

      {/* Search Bar */}
      <div className="hospital-search">
        <input
          type="text"
          placeholder="Search hospitals by name..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <button onClick={fetchHospitals}>
          🔄 Refresh
        </button>
      </div>

      {/* Results Info */}
      <motion.div
        style={{
          padding: '16px 24px',
          background: 'rgba(0, 217, 255, 0.1)',
          border: '1.5px solid #00D9FF',
          borderRadius: '12px',
          marginBottom: '30px',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p style={{ color: '#00D9FF', fontWeight: '700', margin: '0', fontSize: '15px' }}>
          📍 {filteredHospitals.length} Hospitals Found
        </p>
        <p style={{ color: 'var(--text-light)', margin: '6px 0 0 0', fontSize: '13px' }}>
          Within 15km Search Radius • 24/7 Emergency Service
        </p>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#00D9FF'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>🏥</div>
          <p style={{ fontSize: '16px', fontWeight: '600' }}>Loading hospitals...</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          style={{
            background: 'rgba(255, 107, 107, 0.15)',
            border: '1.5px solid #FF6B6B',
            color: '#FF8E8E',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '30px'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p style={{ margin: 0, fontWeight: '600' }}>{error}</p>
          <button
            onClick={fetchHospitals}
            style={{
              marginTop: '12px',
              background: '#FF6B6B',
              border: 'none',
              color: '#FFFFFF',
              padding: '8px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '13px'
            }}
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Hospitals List */}
      {!loading && filteredHospitals.length > 0 && (
        <div className="hospitals-list">
          {filteredHospitals.map((hospital, index) => (
            <motion.div
              key={hospital.id || index}
              className="hospital-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                borderColor: getHospitalTypeBorder(hospital.name),
                background: getHospitalTypeColor(hospital.name)
              }}
            >
              {/* Hospital Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '16px' }}>
                <div style={{
                  fontSize: '36px',
                  minWidth: '50px',
                  textAlign: 'center'
                }}>
                  {getHospitalTypeIcon(hospital.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    color: '#FFFFFF',
                    margin: '0 0 6px 0',
                    fontSize: '18px',
                    fontWeight: '800'
                  }}>
                    {hospital.name}
                  </h3>
                  <div className="hospital-category">
                    {hospital.name.includes('Teaching') || hospital.name.includes('University') ? '🏫 Teaching Hospital' :
                     hospital.name.includes('Clinic') ? '⚕️ Clinic' :
                     hospital.name.includes('Private') ? '🏥 Private Hospital' :
                     '🏥 General Hospital'}
                  </div>
                </div>
              </div>

              {/* Hospital Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(0, 217, 255, 0.1)'
              }}>
                {/* Location */}
                <div>
                  <p style={{
                    color: 'var(--text-lighter)',
                    fontSize: '12px',
                    margin: '0 0 6px 0',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    📍 Location
                  </p>
                  <p style={{
                    color: '#FFFFFF',
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: '600',
                    lineHeight: '1.5'
                  }}>
                    {hospital.address}
                  </p>
                </div>

                {/* Distance */}
                <div>
                  <p style={{
                    color: 'var(--text-lighter)',
                    fontSize: '12px',
                    margin: '0 0 6px 0',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    📏 Distance
                  </p>
                  <p style={{
                    color: '#00D9FF',
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '800'
                  }}>
                    {hospital.distance ? `${hospital.distance.toFixed(2)} km` : 'N/A'}
                  </p>
                </div>

                {/* Rating */}
                <div>
                  <p style={{
                    color: 'var(--text-lighter)',
                    fontSize: '12px',
                    margin: '0 0 6px 0',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    ⭐ Rating
                  </p>
                  <p style={{
                    color: '#FFD700',
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '800'
                  }}>
                    {hospital.rating || 'N/A'} / 5
                  </p>
                </div>

                {/* Beds */}
                <div>
                  <p style={{
                    color: 'var(--text-lighter)',
                    fontSize: '12px',
                    margin: '0 0 6px 0',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    🛏️ Beds
                  </p>
                  <p style={{
                    color: '#FFFFFF',
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '800'
                  }}>
                    {hospital.beds || hospital.total_beds || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Services */}
              {hospital.services && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{
                    color: 'var(--text-lighter)',
                    fontSize: '12px',
                    margin: '0 0 8px 0',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    💼 Services
                  </p>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {(Array.isArray(hospital.services) ? hospital.services : hospital.services.split(',')).slice(0, 3).map((service, i) => (
                      <span key={i} style={{
                        background: 'rgba(0, 217, 255, 0.15)',
                        color: '#00D9FF',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {service.trim()}
                      </span>
                    ))}
                    {(Array.isArray(hospital.services) ? hospital.services.length : hospital.services.split(',').length) > 3 && (
                      <span style={{
                        background: 'rgba(0, 217, 255, 0.15)',
                        color: '#00D9FF',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        +{(Array.isArray(hospital.services) ? hospital.services.length : hospital.services.split(',').length) - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="hospital-buttons">
                <motion.a
                  href={`tel:${hospital.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📞 Call Now
                </motion.a>
                <motion.a
                  href={`https://www.google.com/maps?q=${hospital.latitude},${hospital.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🗺️ Directions
                </motion.a>
              </div>

              {/* Emergency Badge */}
              {hospital.is_emergency && (
                <motion.div
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'rgba(46, 213, 115, 0.2)',
                    border: '1px solid #2ED573',
                    borderRadius: '8px',
                    color: '#2ED573',
                    fontSize: '12px',
                    fontWeight: '700',
                    textAlign: 'center'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ✓ 24/7 Emergency Service Available
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* No Results State */}
      {!loading && filteredHospitals.length === 0 && !error && (
        <motion.div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#00D9FF'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔍</div>
          <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>
            {searchQuery ? 'No hospitals found' : 'No hospitals available'}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
            {searchQuery ? 'Try a different search term' : 'Please check back later'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default HospitalMap;