import React, { useEffect, useState } from 'react';
import useCurrentLocation from './useCurrentLocation';
import axios from 'axios';
import '../styles/SpeedLimit.css'; 

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

  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setSpeedLimit(null); // Reset speedLimit when back online to fetch new data
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (location.latitude && location.longitude && isOnline) {
      let adjustedLatitude = location.latitude;
      let adjustedLongitude = location.longitude;

      // Adjust the latitude/longitude based on heading if necessary
      if (location.heading !== null) {
        const offset = 0.0005; // Adjust this value based on desired precision (can vary)

        if (location.heading >= 0 && location.heading <= 90) {
          // Northeast
          adjustedLatitude += offset;
          adjustedLongitude += offset;
        } else if (location.heading > 90 && location.heading <= 180) {
          // Southeast
          adjustedLatitude -= offset;
          adjustedLongitude += offset;
        } else if (location.heading > 180 && location.heading <= 270) {
          // Southwest
          adjustedLatitude -= offset;
          adjustedLongitude -= offset;
        } else if (location.heading > 270 && location.heading <= 360) {
          // Northwest
          adjustedLatitude += offset;
          adjustedLongitude -= offset;
        }
      }

      // Overpass API Query for Speed Limit based on adjusted location
      const query = `[out:json];way(around:50,${adjustedLatitude},${adjustedLongitude})["maxspeed"];out;`;
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

      // Fetch Speed Limit Data
      axios.get(overpassUrl)
        .then(response => {
          const data = response.data.elements;
          if (data.length > 0) {
            const maxSpeed = data[0].tags.maxspeed; // First result's speed limit
            setSpeedLimit(maxSpeed);

            const road = data[0].tags.name || "Unknown Road";
            setLocationDetails(prevDetails => ({ ...prevDetails, road }));
          } else {
            setSpeedLimit("No speed limit data available.");
          }
        })
        .catch(error => {
          console.error('Error fetching data from Overpass API:', error);
          setSpeedLimit("Error fetching speed limit data.");
        });

      // Nominatim API for reverse geocoding using adjusted coordinates
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${adjustedLatitude}&lon=${adjustedLongitude}&format=json`;

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
      setSpeedLimit("No Internet Connection!");
    }
  }, [location, isOnline]);

  const isLoading = speedLimit === null;
  const isError = speedLimit && speedLimit.includes("Error");

  let currentSpeed = location.speed;
  const useTestSpeed = false;

  if (useTestSpeed) {
    currentSpeed = 55; // Hardcoded speed for testing
  }

  const maxSpeed = speedLimit ? parseInt(speedLimit) : 0;
  const backgroundColor = currentSpeed > maxSpeed ? '#ffcccc' : '#f0f0f0';

  useEffect(() => {
    document.body.style.backgroundColor = backgroundColor;

    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [backgroundColor]);

  return (
    <div className="speed-limit-container">
      {/* Display content as before */}
    </div>
  );
}

export default SpeedLimit;
