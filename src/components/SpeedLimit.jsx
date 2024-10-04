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

  useEffect(() => {
    if (location.latitude && location.longitude) {
      // Overpass API Query for Speed Limit
      const query = `[out:json];way(around:50,${location.latitude},${location.longitude})["maxspeed"];out;`;
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

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
          setSpeedLimit("Error fetching speed limit data.");
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
    }
  }, [location]);

  return (
    <div className="speed-limit-container">
      <div className="speed-limit-sign">
        <div className="outer-circle">
          {speedLimit ? (
            <div className="speed-limit-value">
              <p>{speedLimit}</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
      <div className="location-details">
        <p>Road/Street: {locationDetails.road}</p>
        <p>Suburb: {locationDetails.suburb}</p>
        <p>City: {locationDetails.city}, {locationDetails.zip}</p>
        <p>Current Speed: {location.speed !== null ? `${location.speed} km/h` : "Speed data unavailable"}</p>
      </div>
    </div>
  );
}

export default SpeedLimit;
