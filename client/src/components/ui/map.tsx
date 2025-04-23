import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Location, Driver } from "@/lib/types";
import { DEFAULT_LOCATION, DEFAULT_ZOOM } from "@/lib/maps";

// Fix for the default marker icons in Leaflet with React
// Load marker icons since Webpack doesn't handle Leaflet assets properly
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons
const userIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div style="background-color: #3B82F6; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>`,
  iconSize: [15, 15],
  iconAnchor: [7, 7],
});

const driverIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div style="background-color: #FF5733; width: 12px; height: 12px; border-radius: 50%; position: relative;">
          <div style="position: absolute; top: -4px; left: -4px; width: 20px; height: 20px; border-radius: 50%; background-color: rgba(255, 87, 51, 0.2);"></div>
         </div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const destinationIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div style="background-color: #1E293B; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface MapViewProps {
  userLocation: Location;
  destination?: Location;
  drivers?: Driver[];
  onUserLocationChange?: (location: Location) => void;
}

// Component to recenter map when location changes
function ChangeView({ center }: { center: Location }) {
  const map = useMap();
  map.setView([center.lat, center.lng], map.getZoom());
  return null;
}

export function MapView({
  userLocation = DEFAULT_LOCATION,
  destination,
  drivers = [],
  onUserLocationChange
}: MapViewProps) {
  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={DEFAULT_ZOOM}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Update the center when location changes */}
      <ChangeView center={userLocation} />
      
      {/* User marker */}
      <Marker 
        position={[userLocation.lat, userLocation.lng]} 
        icon={userIcon}
        draggable={!!onUserLocationChange}
        eventHandlers={onUserLocationChange ? {
          dragend: (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            onUserLocationChange({
              lat: position.lat,
              lng: position.lng
            });
          }
        } : {}}
      >
        <Popup>Your location</Popup>
      </Marker>
      
      {/* Destination marker */}
      {destination && (
        <Marker 
          position={[destination.lat, destination.lng]} 
          icon={destinationIcon}
        >
          <Popup>Destination</Popup>
        </Marker>
      )}
      
      {/* Driver markers */}
      {drivers.map((driver) => (
        <Marker 
          key={driver.id}
          position={[driver.currentLat, driver.currentLng]} 
          icon={driverIcon}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-medium">{driver.fullName}</div>
              <div>{driver.carModel}</div>
              <div>Rating: {driver.rating.toFixed(1)}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
