import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { calculateDistance, calculateSpeed } from '../utils/haversine';

export function useISSData() {
  const [positions, setPositions] = useState([]); // Last 15 positions
  const [speeds, setSpeeds] = useState([]); // Last 30 speeds
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [locationName, setLocationName] = useState('Unknown Location');
  const [astronauts, setAstronauts] = useState({ number: 0, people: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLocationName = async (lat, lon) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
      );
      if (res.data && res.data.address) {
        const addr = res.data.address;
        const name = addr.city || addr.town || addr.village || addr.state || addr.country || 'Ocean / Unknown';
        setLocationName(name);
      } else {
        setLocationName('Ocean / Unmapped area');
      }
    } catch (err) {
      console.error("Geocoding error", err);
      setLocationName('Ocean / Unmapped area');
    }
  };

  const fetchAstronauts = async () => {
    try {
      const res = await axios.get('http://api.open-notify.org/astros.json');
      if (res.data) {
        setAstronauts({
          number: res.data.number,
          people: res.data.people
        });
      }
    } catch (err) {
      console.error("Astronauts fetch error", err);
    }
  };

  const fetchISSLocation = useCallback(async () => {
    try {
      setError(null);
      const res = await axios.get('http://api.open-notify.org/iss-now.json');
      const data = res.data;
      
      if (data.message === "success") {
        const newPos = {
          lat: parseFloat(data.iss_position.latitude),
          lon: parseFloat(data.iss_position.longitude),
          timestamp: data.timestamp
        };

        setPositions((prev) => {
          const lastPos = prev[prev.length - 1];
          let speed = 0;
          
          if (lastPos) {
            const dist = calculateDistance(lastPos.lat, lastPos.lon, newPos.lat, newPos.lon);
            const timeDiff = newPos.timestamp - lastPos.timestamp; // in seconds
            speed = calculateSpeed(dist, timeDiff);
            
            // Sometimes APIs return the same timestamp if cached too heavily, avoid infinity
            if (!isFinite(speed)) speed = 0;
            
            setCurrentSpeed(speed);
            
            setSpeeds(prevSpeeds => {
              const newSpeeds = [...prevSpeeds, { time: new Date(newPos.timestamp * 1000).toLocaleTimeString(), speed: Math.round(speed) }];
              if (newSpeeds.length > 30) return newSpeeds.slice(newSpeeds.length - 30);
              return newSpeeds;
            });
          }

          const newPositions = [...prev, newPos];
          // Keep last 15 positions
          if (newPositions.length > 15) return newPositions.slice(newPositions.length - 15);
          return newPositions;
        });

        // Fetch location name (reverse geocoding)
        await fetchLocationName(newPos.lat, newPos.lon);
      }
    } catch (err) {
      setError("Failed to fetch ISS location");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAstronauts();
    fetchISSLocation();

    const intervalId = setInterval(() => {
      fetchISSLocation();
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId);
  }, [fetchISSLocation]);

  return {
    positions,
    currentPos: positions[positions.length - 1] || null,
    currentSpeed,
    speeds,
    locationName,
    astronauts,
    loading,
    error,
    refresh: fetchISSLocation
  };
}
