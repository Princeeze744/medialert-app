import React, { useState } from 'react';
import './App.css';
import './styles/screens.css';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AssessmentScreen from './screens/AssessmentScreen';
import ResultScreen from './screens/ResultScreen';
import HospitalMap from './screens/HospitalMap';
import DoctorBooking from './screens/DoctorBooking';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showHospitalMap, setShowHospitalMap] = useState(false);
  const [showDoctorBooking, setShowDoctorBooking] = useState(false);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setCurrentScreen('login');
  };

  const handleStartAssessment = () => {
    setCurrentScreen('assessment');
  };

  const handleAssessmentComplete = (result) => {
    setAssessmentResult(result);
    setCurrentScreen('result');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setAssessmentResult(null);
  };

  const handleOpenHospitalMap = () => {
    setShowHospitalMap(true);
  };

  const handleOpenDoctorBooking = () => {
    setShowDoctorBooking(true);
  };

  return (
    <div className="app">
      {currentScreen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      
      {currentScreen === 'home' && (
        <HomeScreen 
          user={user} 
          onStartAssessment={handleStartAssessment}
          onLogout={handleLogout}
          onOpenHospitalMap={handleOpenHospitalMap}
          onOpenDoctorBooking={handleOpenDoctorBooking}
        />
      )}
      
      {currentScreen === 'assessment' && (
        <AssessmentScreen 
          onAssessmentComplete={handleAssessmentComplete}
          onCancel={handleBackToHome}
        />
      )}
      
      {currentScreen === 'result' && (
        <ResultScreen 
          result={assessmentResult}
          onBackToHome={handleBackToHome}
        />
      )}

      {showHospitalMap && (
        <HospitalMap onBack={() => setShowHospitalMap(false)} />
      )}

      {showDoctorBooking && (
        <DoctorBooking onBack={() => setShowDoctorBooking(false)} />
      )}
    </div>
  );
}

export default App;