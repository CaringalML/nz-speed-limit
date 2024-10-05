import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import SpeedLimit from './components/SpeedLimit';
import SpeedLimitList from './components/speed-limit-list'; // Import the new component

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>

          {/* Root route */}
          <Route path="/" element={<SpeedLimit />} />
          {/* New route for speed-limit-list */}
          <Route path="/speed-limit-list" element={<SpeedLimitList />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
