import { useState, useEffect } from 'react';

function useCurrentLocation() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    speed: null, // Speed in km/h
    heading: null, // Add heading (compass direction)
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
          speed: position.coords.speed ? Math.floor(position.coords.speed * 3.6) : null, // Convert m/s to km/h
          heading: position.coords.heading || null, // Include heading (compass direction)
        });
      },
      (error) => console.error("Error fetching location:", error),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId); // Cleanup on unmount
  }, []);

  return location;
}

export default useCurrentLocation;
