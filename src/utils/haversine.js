export function calculateSpeed(pos1, pos2, timeDiffSeconds) {
  const R = 6371; // Earth's radius in km 
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(pos2.lat - pos1.lat);
  // Support both lng and lon properties
  const lng1 = pos1.lng !== undefined ? pos1.lng : pos1.lon;
  const lng2 = pos2.lng !== undefined ? pos2.lng : pos2.lon;
  const dLon = toRad(lng2 - lng1); 
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(pos1.lat)) * Math.cos(toRad(pos2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const distance = R * c; 
  if (timeDiffSeconds === 0) return 0;
  const speed = (distance / timeDiffSeconds) * 3600; // km/h 
  return speed;
}
