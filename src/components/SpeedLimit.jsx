import React, { useEffect, useState } from 'react';
import useCurrentLocation from './useCurrentLocation';
import axios from 'axios';
import '../styles/SpeedLimit.css'; // Updated import statement

function SpeedLimit() {
  const [speedLimit, setSpeedLimit] = useState(null);
  const [locationDetails, setLocationDetails] = useState({
    road: "Unknown Road",
    suburb: "Unknown Suburb",
    city: "Unknown City",
    zip: "Unknown Zip Code"
  });
  const location = useCurrentLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Toggle this flag to enable/disable test code
  // const useTestSpeed = true; // Set to true to use test speed
  const useTestSpeed = false; // Set to false to use actual speed


  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setSpeedLimit(null); // Reset speedLimit when back online to fetch new data
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Cleanup the event listeners on component unmount
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (location.latitude && location.longitude && isOnline) {
      // Overpass API Query for Speed Limit
      const query = `[out:json];way(around:50,${location.latitude},${location.longitude})["maxspeed"];out;`;
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

      // Fetch Speed Limit Data
      axios.get(overpassUrl)
        .then(response => {
          const data = response.data.elements;
          if (data.length > 0) {
            const maxSpeed = data[0].tags.maxspeed; // First result's speed limit
            setSpeedLimit(maxSpeed);

            // Get road name
            const road = data[0].tags.name || "Unknown Road";
            setLocationDetails(prevDetails => ({ ...prevDetails, road }));
          } else {
            setSpeedLimit("No speed limit data available.");
          }
        })
        .catch(error => {
          console.error('Error fetching data from Overpass API:', error);
          setSpeedLimit("Error fetching speed limit data."); // Error message
        });

      // Nominatim API for reverse geocoding
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json`;

      axios.get(nominatimUrl)
        .then(response => {
          const address = response.data.address || {};
          const suburb = address.suburb || "Unknown Suburb";
          const city = address.city || address.town || "Unknown City";
          const zip = address.postcode || "Unknown Zip Code";

          setLocationDetails(prevDetails => ({
            ...prevDetails,
            suburb,
            city,
            zip
          }));
        })
        .catch(error => {
          console.error('Error fetching data from Nominatim API:', error);
          setLocationDetails(prevDetails => ({
            ...prevDetails,
            suburb: "Error fetching suburb",
            city: "Error fetching city",
            zip: "Error fetching zip code"
          }));
        });
    } else if (!isOnline) {
      setSpeedLimit("No Internet Connection!"); // Set error message for offline status
    }
  }, [location, isOnline]);

  // Determine if data is loading or has an error
  const isLoading = speedLimit === null;
  const isError = speedLimit && speedLimit.includes("Error");

  // Test speed code
  let currentSpeed = location.speed; // Use current speed from useCurrentLocation
  if (useTestSpeed) {
    // Uncomment the following line to use a test speed
    currentSpeed = 55; // Hardcoded speed for testing
  }

  const maxSpeed = speedLimit ? parseInt(speedLimit) : 0; // Parse speed limit as integer

  return (
    <div className="speed-limit-container">
      <div className="speed-limit-sign">
        <div className="outer-circle">
          {isLoading ? (
            <p className="loading-message">Fetching Speed Limit Data...</p>
          ) : isError ? (
            <p className="error-message">{speedLimit}</p> // Error message display
          ) : isOnline ? (
            <div className="speed-limit-value">
              <p>{speedLimit}</p>
              {currentSpeed > maxSpeed && (
                <p className="slow-down-message">Slow Down!</p> // Display warning if exceeding speed limit
              )}
            </div>
          ) : (
            <p className="offline-message">{speedLimit}</p> // Display for no internet connection
          )}
        </div>
      </div>
      <div className="location-details">
        <p>Road/Street: {locationDetails.road}</p>
        <p>Suburb: {locationDetails.suburb}</p>
        <p>City: {locationDetails.city}, {locationDetails.zip}</p>
        <p>Current Speed: {currentSpeed} km/h</p> {/* Display the current speed */}
      </div>
    </div>
  );
}

export default SpeedLimit;
