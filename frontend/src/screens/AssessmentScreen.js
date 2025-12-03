import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import '../App.css';

const API_URL = 'http://localhost:8000';

const SYMPTOMS = [
  { id: 1, label: 'Fever', emoji: '🤒' },
  { id: 2, label: 'Cough', emoji: '🫁' },
  { id: 3, label: 'Chest Pain', emoji: '❤️' },
  { id: 4, label: 'Difficulty Breathing', emoji: '😮‍💨' },
  { id: 5, label: 'Severe Bleeding', emoji: '🩸' },
  { id: 6, label: 'Severe Headache', emoji: '🤕' },
  { id: 7, label: 'Dizziness', emoji: '😵' },
  { id: 8, label: 'Nausea', emoji: '🤢' },
  { id: 9, label: 'Fracture', emoji: '🦴' },
  { id: 10, label: 'Burns', emoji: '🔥' }
];

function AssessmentScreen({ onAssessmentComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [otherSymptoms, setOtherSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [painRating, setPainRating] = useState(5);
  const [medicalHistory, setMedicalHistory] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(4.8156);
  const [longitude, setLongitude] = useState(6.9271);

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && selectedSymptoms.length === 0) {
      alert('Please select at least one symptom');
      return;
    }
    if (step === 2 && !age) {
      alert('Please enter your age');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmitAssessment = async () => {
    setLoading(true);
    try {
      const symptoms = [
        ...selectedSymptoms,
        ...(otherSymptoms ? [otherSymptoms] : [])
      ];

      const response = await axios.post(`${API_URL}/api/emergency/assess`, {
        symptoms,
        age: parseInt(age),
        pain_rating: painRating,
        medical_history: medicalHistory,
        current_medications: medications,
        allergies,
        latitude,
        longitude,
        location_address: 'Current Location'
      });

      onAssessmentComplete(response.data);
    } catch (error) {
      alert('Error submitting assessment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="assessment-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="assessment-card">
        <motion.button
          onClick={onCancel}
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
          ← Back
        </motion.button>

        <h2>🏥 Emergency Assessment</h2>
        <div className="assessment-step">Step {step} of 3</div>

        {/* Step 1: Symptoms */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="form-group">
              <label>What symptoms are you experiencing?</label>
              <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '8px' }}>
                Select all that apply
              </p>

              <div className="symptoms-list">
                {SYMPTOMS.map(symptom => (
                  <motion.button
                    key={symptom.id}
                    className={`symptom-tag ${selectedSymptoms.includes(symptom.label) ? 'selected' : ''}`}
                    onClick={() => toggleSymptom(symptom.label)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span style={{ fontSize: '18px', marginRight: '6px' }}>
                      {symptom.emoji}
                    </span>
                    {symptom.label}
                  </motion.button>
                ))}
              </div>

              <div style={{ marginTop: '24px' }}>
                <label>Other symptoms (optional)</label>
                <textarea
                  value={otherSymptoms}
                  onChange={(e) => setOtherSymptoms(e.target.value)}
                  placeholder="Describe any other symptoms..."
                  style={{
                    minHeight: '100px',
                    resize: 'vertical',
                    marginTop: '8px'
                  }}
                />
              </div>
            </div>

            <div className="assessment-buttons">
              <button className="btn-cancel" onClick={onCancel}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleNextStep}>
                Next Step
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Personal Info */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                min="1"
                max="150"
              />
            </div>

            <div className="form-group">
              <label>Pain Rating (1-10)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={painRating}
                  onChange={(e) => setPainRating(parseInt(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '24px', fontWeight: '700', color: '#00D9FF', minWidth: '50px' }}>
                  {painRating}/10
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Medical History</label>
              <textarea
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="Any chronic conditions, past surgeries, etc."
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div className="assessment-buttons">
              <button className="btn-cancel" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn-submit" onClick={handleNextStep}>
                Next Step
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Additional Info */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="form-group">
              <label>Current Medications</label>
              <textarea
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="List any medications you're taking"
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label>Allergies</label>
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="List any allergies (medications, foods, etc.)"
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1.5px solid #FFD700',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '28px'
            }}>
              <p style={{ color: '#FFD700', fontWeight: '700', margin: '0 0 8px 0' }}>
                ⚠️ Important
              </p>
              <p style={{ color: 'var(--text-light)', margin: 0, fontSize: '14px' }}>
                This assessment helps provide preliminary guidance. Always seek professional medical advice for serious concerns.
              </p>
            </div>

            <div className="assessment-buttons">
              <button className="btn-cancel" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                className="btn-submit"
                onClick={handleSubmitAssessment}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Get Assessment'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default AssessmentScreen;