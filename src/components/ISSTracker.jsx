import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { RefreshCw, Users } from 'lucide-react';

// Fix Leaflet marker icon issue in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const customMarker = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

// Component to auto-center map when ISS moves
function MapUpdater({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function ISSTracker({ issData }) {
  const { positions, currentPos, currentSpeed, locationName, astronauts, loading, refresh } = issData;

  if (loading && !currentPos) {
    return <div className="p-4 bg-card text-card-foreground rounded-lg border shadow-sm animate-pulse h-96 flex items-center justify-center">Loading ISS Data...</div>;
  }

  if (!currentPos) {
    return <div className="p-4 bg-card text-card-foreground rounded-lg border shadow-sm">No data available</div>;
  }

  const polylinePositions = positions.map(p => [p.lat, p.lon]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Map Section */}
      <div className="lg:col-span-2 h-[400px] rounded-lg overflow-hidden border shadow-sm relative">
        <MapContainer center={[currentPos.lat, currentPos.lon]} zoom={3} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={[currentPos.lat, currentPos.lon]} />
          
          <Polyline positions={polylinePositions} color="red" />
          
          <Marker position={[currentPos.lat, currentPos.lon]} icon={customMarker}>
            <Popup>
              <strong>ISS Current Location</strong><br/>
              Lat: {currentPos.lat.toFixed(4)}<br/>
              Lon: {currentPos.lon.toFixed(4)}
            </Popup>
          </Marker>
        </MapContainer>
        
        <button 
          onClick={refresh}
          className="absolute top-4 right-4 z-[400] bg-background text-foreground p-2 rounded-md shadow-md border hover:bg-accent flex items-center gap-2"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-4">
        <div className="bg-card text-card-foreground p-4 rounded-lg border shadow-sm">
          <h2 className="text-xl font-bold mb-4">ISS Live Stats</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Coordinates:</span>
              <span className="font-mono">{currentPos.lat.toFixed(4)}, {currentPos.lon.toFixed(4)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Speed:</span>
              <span className="font-mono">{currentSpeed.toFixed(0)} km/h</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Above:</span>
              <span className="font-medium text-right max-w-[150px] truncate" title={locationName}>{locationName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Positions Tracked:</span>
              <span className="font-mono">{positions.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-card text-card-foreground p-4 rounded-lg border shadow-sm flex-1">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users size={20} /> People in Space
          </h2>
          <div className="text-3xl font-bold mb-4">{astronauts.number} Total</div>
          <div className="max-h-[120px] overflow-y-auto">
            <ul className="space-y-1 text-sm">
              {astronauts.people.map((person, idx) => (
                <li key={idx} className="flex justify-between bg-muted p-2 rounded">
                  <span>{person.name}</span>
                  <span className="text-xs text-muted-foreground uppercase">{person.craft}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
