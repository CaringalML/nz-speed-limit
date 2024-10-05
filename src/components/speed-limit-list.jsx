import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HERE_API_KEY = '7LLq4rJ4o8OQtrpJ6la6VIRK-ZtOOb2eN23lFlqGe2E';  // Your HERE API key

const SpeedLimitList = () => {
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadData = async () => {
      try {
        const lat = '-37.7870';  // Latitude for Hamilton
        const lon = '175.2793';  // Longitude for Hamilton
        const radius = '5000';    // Search radius in meters

        // The correct layer ID for roads (as per HERE documentation)
        const layerIds = 'road'; // or use 'roadLink' depending on your requirement

        const response = await axios.get(
          `https://fleet.ls.hereapi.com/2/search/proximity.json?apiKey=${HERE_API_KEY}&prox=${lat},${lon},${radius}&layer_ids=${layerIds}&attributes=FCS&responseattributes=FC,NAME,SPEED_CATEGORY`
        );

        const roadData = response.data?.roads || [];
        if (roadData.length > 0) {
          const roadSpeedLimits = roadData.map((road) => ({
            roadName: road.name || 'Unknown Road',
            speedLimit: road.speedCategory ? `${road.speedCategory} km/h` : 'N/A',
          }));

          setRoads(roadSpeedLimits);
        } else {
          console.log('No roads found or response data is empty.');
        }
      } catch (error) {
        console.error('Error fetching road data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadData();
  }, []);

  return (
    <div>
      <h2>Speed Limits for Hamilton Roads</h2>
      {loading ? (
        <p>Loading roads...</p>
      ) : roads.length > 0 ? (
        <ul>
          {roads.map((road, index) => (
            <li key={index}>
              {road.roadName}: {road.speedLimit}
            </li>
          ))}
        </ul>
      ) : (
        <p>No speed limits found for roads in Hamilton.</p>
      )}
    </div>
  );
};

export default SpeedLimitList;
