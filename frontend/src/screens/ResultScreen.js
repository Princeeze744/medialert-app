import React from 'react';
import { motion } from 'framer-motion';
import '../App.css';

function ResultScreen({ result, onBackToHome }) {
  if (!result) {
    return (
      <div className="result-container">
        <div className="result-card">
          <p style={{ textAlign: 'center', color: '#FF6B6B' }}>Error: No assessment result</p>
        </div>
      </div>
    );
  }

  const severity = result.severity_level || 'YELLOW';
  
  let assessmentResult = {};
  try {
    if (typeof result.assessment_result === 'string') {
      assessmentResult = JSON.parse(result.assessment_result);
    } else {
      assessmentResult = result.assessment_result || {};
    }
  } catch (e) {
    // If parsing fails, use default values
    assessmentResult = {
      recommendation: 'Please consult with a healthcare professional',
      action: 'Contact your doctor',
      estimated_response: 'ASAP',
      phone: '112'
    };
  }

  const getSeverityIcon = () => {
    switch (severity) {
      case 'RED':
        return '🚨';
      case 'YELLOW':
        return '⚠️';
      case 'GREEN':
        return '✅';
      default:
        return '❓';
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'RED':
        return '#FF6B6B';
      case 'YELLOW':
        return '#FFD700';
      case 'GREEN':
        return '#2ED573';
      default:
        return '#00D9FF';
    }
  };

  const severityLabel = {
    RED: 'CRITICAL - EMERGENCY',
    YELLOW: 'URGENT - See Doctor Within Hours',
    GREEN: 'Low Risk - Monitor at Home'
  };

  return (
    <motion.div
      className="result-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="result-card">
        <motion.button
          onClick={onBackToHome}
          style={{
            background: 'none',
            border: 'none',
            color: '#00D9FF',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '30px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          whileHover={{ x: -5 }}
        >
          ← Back to Home
        </motion.button>

        {/* Severity Badge */}
        <motion.div
          className="severity-badge"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            borderColor: getSeverityColor(),
            background: `rgba(${
              severity === 'RED' ? '255, 107, 107' :
              severity === 'YELLOW' ? '255, 215, 0' :
              '46, 213, 115'
            }, 0.15)`
          }}
        >
          <div className="severity-icon">{getSeverityIcon()}</div>
        </motion.div>

        {/* Severity Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h2 style={{
            color: getSeverityColor(),
            fontSize: '28px',
            fontWeight: '800',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px'
          }}>
            {severityLabel[severity]}
          </h2>
          <p style={{
            color: '#00D9FF',
            fontSize: '15px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Assessment ID: #{result.id}
          </p>
        </motion.div>

        {/* Main Recommendation */}
        <motion.div
          className="result-details"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            borderColor: getSeverityColor(),
            background: `rgba(${
              severity === 'RED' ? '255, 107, 107' :
              severity === 'YELLOW' ? '255, 215, 0' :
              '46, 213, 115'
            }, 0.1)`
          }}
        >
          <h3 style={{ color: getSeverityColor(), marginBottom: '15px' }}>
            📋 Recommendation
          </h3>
          <p style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600', lineHeight: '1.8' }}>
            {assessmentResult?.recommendation || 'Please follow medical guidance'}
          </p>
        </motion.div>

        {/* Action Items */}
        <motion.div
          className="result-details"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 style={{ color: '#00D9FF', marginBottom: '15px' }}>
            🎯 Recommended Action
          </h3>
          <p style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600', lineHeight: '1.8' }}>
            {assessmentResult?.action || 'Consult a healthcare professional'}
          </p>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="result-details"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 style={{ color: '#00D9FF', marginBottom: '15px' }}>
            ⏱️ Expected Response Time
          </h3>
          <p style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600' }}>
            {assessmentResult?.estimated_response || 'Contact local services'}
          </p>
        </motion.div>

        {/* Emergency Contact */}
        {severity === 'RED' && (
          <motion.div
            className="result-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{
              borderColor: '#FF6B6B',
              background: 'rgba(255, 107, 107, 0.15)'
            }}
          >
            <h3 style={{ color: '#FF6B6B', marginBottom: '15px' }}>
              🚑 Emergency Contact
            </h3>
            <p style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
              Call Emergency Services Immediately:
            </p>
            <a
              href={`tel:${assessmentResult?.phone || '112'}`}
              style={{
                display: 'inline-block',
                background: '#FF6B6B',
                color: '#FFFFFF',
                padding: '12px 32px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            >
              📞 {assessmentResult?.phone || '112'}
            </a>
          </motion.div>
        )}

        {/* Important Note */}
        <motion.div
          style={{
            background: 'rgba(0, 217, 255, 0.1)',
            border: '1.5px solid #00D9FF',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '28px',
            marginTop: '28px'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <p style={{ color: '#00D9FF', fontWeight: '700', margin: '0 0 10px 0', fontSize: '15px' }}>
            ℹ️ Important Disclaimer
          </p>
          <p style={{ color: 'var(--text-light)', margin: 0, fontSize: '14px', lineHeight: '1.7' }}>
            This assessment is AI-powered and provides preliminary guidance only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for serious health concerns.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="result-buttons">
          <motion.button
            className="btn-home"
            onClick={onBackToHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Home
          </motion.button>
        </div>

        {/* Symptoms Summary */}
        <motion.div
          style={{
            background: 'rgba(26, 32, 44, 0.95)',
            border: '1px solid rgba(0, 217, 255, 0.2)',
            borderRadius: '14px',
            padding: '20px',
            marginTop: '28px'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h4 style={{ color: '#00D9FF', marginBottom: '15px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            📝 Assessment Details
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            <div>
              <p style={{ color: 'var(--text-lighter)', fontSize: '13px', margin: '0 0 6px 0' }}>Age</p>
              <p style={{ color: '#FFFFFF', fontWeight: '700', margin: 0 }}>{result.age} years</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-lighter)', fontSize: '13px', margin: '0 0 6px 0' }}>Pain Level</p>
              <p style={{ color: '#FFFFFF', fontWeight: '700', margin: 0 }}>{result.pain_rating}/10</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-lighter)', fontSize: '13px', margin: '0 0 6px 0' }}>Symptoms</p>
              <p style={{ color: '#FFFFFF', fontWeight: '700', margin: 0 }}>
                {result.symptoms ? result.symptoms.split(',').length : 0} reported
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-lighter)', fontSize: '13px', margin: '0 0 6px 0' }}>Assessment Time</p>
              <p style={{ color: '#FFFFFF', fontWeight: '700', margin: 0 }}>
                {new Date(result.created_at || new Date()).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ResultScreen;