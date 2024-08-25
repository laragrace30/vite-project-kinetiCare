import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; 
import './App.css';
import { logoWOname, bgImage, appName, emailIcon, passwordIcon } from './assets';
import Dashboard from './screens/dashboard'; 
import Users from './screens/users';
import Reports from './screens/reports';
import Feedback from './screens/feedback';
import TherapistDetails from './screens/therapistDetails';
import PatientDetails from './screens/patientDetails';
import { auth } from './firebase/firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Logged in user:', user);
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        console.error('Unknown error', error);
      }
    }
  };

  return (
    <div id="root">
      <section className="section-left">
        <h3>WELCOME BACK</h3>
        <h1>Welcome back! Please enter your details.</h1>
        <form onSubmit={handleLogin}>
          <h2>Email</h2>
          <div className="inputEmail-container">
            <img src={emailIcon} alt="Email Icon" className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <h4>Password</h4>
          <div className="inputPass-container">
            <img src={passwordIcon} alt="Password Icon" className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              className="password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <h6>Forgot password?</h6>
          <button type="submit">Login</button>
        </form>
      </section>
      <section className="section-right">
        <div className="logo-container">
          <img src={logoWOname} alt="Logo" className="logo" />
          <img src={appName} alt="App Name" className="appName" />
        </div>
        <img src={bgImage} alt="Background" className="background-image" />
      </section>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/therapistDetails/:id" element={<TherapistDetails />} />
        <Route path="/patientDetails/:id" element={<PatientDetails />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </Router>
  );
}

export default App;
