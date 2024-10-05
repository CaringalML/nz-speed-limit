// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SpeedLimit from './components/SpeedLimit';
import SpeedLimitList from './components/SpeedLimitList'; // Ensure this component is correctly imported

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Define your routes here */}
          <Route path="/nz-speed-limit" element={<SpeedLimit />} />
          <Route path="/speed-limit-list" element={<SpeedLimitList />} />
          
          {/* Optional: Define a default route (commented out) */}
          {/* <Route path="/" element={<Navigate to="/nz-speed-limit" />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
