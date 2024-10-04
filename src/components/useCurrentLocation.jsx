import { useState, useEffect } from 'react';

function useCurrentLocation() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    speed: null, // Add speed
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed ? (position.coords.speed * 3.6).toFixed(2) : null // Convert from m/s to km/h
        });
      },
      (error) => console.error("Error fetching location:", error),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId); // Clear geolocation on unmount
  }, []);

  return location;
}

export default useCurrentLocation;
