import React, { useEffect, useState, useRef } from 'react';
import useCurrentLocation from './useCurrentLocation';
// import axios from 'axios';
import '../styles/SpeedLimit.css';

function SpeedLimit() {
  const [speedLimit, setSpeedLimit] = useState(null);
  const [locationDetails] = useState({
    road: "Unknown Road",
    suburb: "Unknown Suburb",
    city: "Unknown City",
    zip: "Unknown Zip Code"
  });
  const location = useCurrentLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const audioRef = useRef(new Audio('/src/audio/buzzer.mp3'));
  
  // Toggle this flag to enable/disable test code
  const useTestSpeed = false;

  // Initialize Web Audio API
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.error("Web Audio API is not supported in this browser:", error);
    }
    
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setSpeedLimit(null);
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Rest of your existing API call effect...

  const isLoading = speedLimit === null;
  const isError = speedLimit && speedLimit.includes("Error");

  let currentSpeed = location.speed;
  if (useTestSpeed) {
    currentSpeed = 55;
  }

  const maxSpeed = speedLimit ? parseInt(speedLimit) : 0;

  // Attempt multiple audio playback strategies
  useEffect(() => {
    if (currentSpeed > maxSpeed && maxSpeed !== 0) {
      // Strategy 1: Try standard Audio API
      audioRef.current.play().catch(() => {
        // Strategy 2: If Audio API fails, try Web Audio API
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        
        if (audioContextRef.current && !oscillatorRef.current) {
          try {
            oscillatorRef.current = audioContextRef.current.createOscillator();
            oscillatorRef.current.connect(audioContextRef.current.destination);
            oscillatorRef.current.type = 'square';
            oscillatorRef.current.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
            oscillatorRef.current.start();
          } catch (error) {
            console.error("Failed to create oscillator:", error);
          }
        }
      });
    } else {
      // Stop all audio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
    }
  }, [currentSpeed, maxSpeed]);

  const backgroundColor = currentSpeed > maxSpeed ? '#ffcccc' : '#f0f0f0';

  useEffect(() => {
    document.body.style.backgroundColor = backgroundColor;
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [backgroundColor]);

  return (
    <div className="speed-limit-container">
      <div className="speed-limit-sign">
        <div className="outer-circle">
          {isLoading ? (
            <p className="loading-message">Fetching Speed Limit Data...</p>
          ) : isError ? (
            <p className="error-message">{speedLimit}</p>
          ) : isOnline ? (
            <div className="speed-limit-value">
              <p>{speedLimit}</p>
            </div>
          ) : (
            <p className="offline-message">{speedLimit}</p>
          )}
        </div>
      </div>
      <div className="location-details">
        <p>Road/Street: {locationDetails.road}</p>
        <p>Suburb: {locationDetails.suburb}</p>
        <p>City: {locationDetails.city}, {locationDetails.zip}</p>
        <div className="current-speed">
          {currentSpeed <= maxSpeed ? (
            <p className="current-speed-value">
              {currentSpeed}<span className="current-speed-unit">km/h</span>
            </p>
          ) : (
            <p className="slow-down-message">Slow Down!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpeedLimit;