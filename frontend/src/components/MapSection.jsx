import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correction des icônes par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapSection = () => {
  const position = [14.7167, -17.4677]; // Almadies, Dakar

  return (
    <section className="py-24 bg-card border-t border-b border-border">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <span className="text-gold uppercase tracking-[.25em] text-sm">Où nous trouver</span>
          <h2 className="text-4xl font-light mt-4 mb-4">
            Notre <span className="text-gold font-semibold">Agence</span>
          </h2>
          <p className="text-gray-400 text-lg">Almadies, Dakar – À deux pas de la Corniche</p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-border shadow-2xl h-[450px]">
          <MapContainer
            center={position}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <Marker position={position}>
              <Popup className="custom-popup">DAKAR DRIVE - Almadies</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </section>
  );
};

export default MapSection;