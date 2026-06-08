'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

export default function InteractivePropertyMap() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    if (!mapRef.current || mapRef.current._leaflet_id) return;

    // Initialize map centered on Pakistan
    const leafletMap = L.map(mapRef.current, {
      center: [30.3753, 69.3451],
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: true,
      touchZoom: true,
    });

    // Satellite base layer
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
      }
    ).addTo(leafletMap);

    // Street layer toggle
    const streetLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }
    );

    // Layer control
    L.control
      .layers(
        {
          Satellite: leafletMap.getPane('tilePane').parentElement,
          'Street Map': streetLayer,
        },
        {}
      )
      .addTo(leafletMap);

    // Drawing toolbar for property boundaries
    const drawnItems = new L.FeatureGroup();
    leafletMap.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          metric: true,
          feet: false,
        },
        polyline: {
          metric: true,
          feet: false,
        },
        rectangle: {
          shapeOptions: {
            color: '#3d9d8f',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.1,
          },
        },
        circle: {
          metric: true,
          shapeOptions: {
            color: '#3d9d8f',
            weight: 2,
          },
        },
        marker: {
          icon: new L.Icon.Default(),
        },
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });

    leafletMap.addControl(drawControl);

    // Handle draw events
    leafletMap.on('draw:created', (e) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        const areaInSqKm = (area / 1000000).toFixed(2);
        const areaInSqMeters = (area / 1).toFixed(0);

        setSelectedArea({
          type: 'polygon',
          areaKm: areaInSqKm,
          areaSqM: areaInSqMeters,
          bounds: layer.getBounds(),
        });

        // Add popup with area info
        layer.bindPopup(
          `<div style="font-size: 12px">
            <strong>Area Info</strong><br/>
            ${areaInSqKm} km² | ${areaInSqMeters} m²
          </div>`
        );
        layer.openPopup();
      }

      if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
        const distance = L.GeometryUtil.length(layer.getLatLngs());
        const distanceKm = (distance / 1000).toFixed(2);

        setMeasurements((prev) => [
          ...prev,
          { type: 'line', distance: distanceKm },
        ]);

        layer.bindPopup(`<div style="font-size: 12px"><strong>Distance</strong><br/>${distanceKm} km</div>`);
        layer.openPopup();
      }
    });

    leafletMap.on('draw:edited', (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        if (layer instanceof L.Polygon) {
          const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
          setSelectedArea({
            type: 'polygon',
            areaKm: (area / 1000000).toFixed(2),
            areaSqM: (area / 1).toFixed(0),
            bounds: layer.getBounds(),
          });
        }
      });
    });

    // Add zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);

    // Add scale
    L.control.scale({ metric: true, imperial: false }).addTo(leafletMap);

    // Sample properties with popups
    const properties = [
      {
        lat: 31.5204,
        lng: 74.3587,
        title: 'Defence Rd, Lahore',
        area: '5000 sqft',
        price: '₨2.5M',
      },
      {
        lat: 31.4765,
        lng: 74.2271,
        title: 'Bahria Town, Lahore',
        area: '3500 sqft',
        price: '₨1.8M',
      },
    ];

    properties.forEach((prop) => {
      L.marker([prop.lat, prop.lng], {
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNPCIBDESL28sMzJdMzEuNSxMzJjLTAuODI4LDAtMS41LTAuNjcyLTEuNS0xLjVWMTZjMC04LjI4MiA2LjcxOC0xNSAxNS0xNXMxNSw2LjcxOCAxNSwxNXYxNC41YzAsMS4xMDQtMC44OTYsMi01LDIuNU0xNiAwQzYuNDEsMCAzLDUuMzcxIDMsMTJjMCw2LjYyOSAxMy4xMDksMjAgMTMsMjBzMTMtMTMuMzcxIDEzLTIwQzI5LDUuMzcxIDI1LjU5LDAgMTYsMHoiIGZpbGw9IiMzZDlkOGYiLz4KPC9zdmc+',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        }),
      })
        .bindPopup(
          `<div style="min-width: 180px; font-family: Inter">
          <strong>${prop.title}</strong><br/>
          ${prop.area} • ${prop.price}<br/>
          <button style="margin-top: 8px; padding: 6px 12px; background: #3d9d8f; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px">
            View Report
          </button>
        </div>`
        )
        .addTo(leafletMap);
    });

    setMap(leafletMap);

    return () => {
      leafletMap.remove();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '600px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e8eaef',
        }}
      />

      {/* Info Panel */}
      {selectedArea && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
            zIndex: 1000,
          }}
        >
          <strong>Selected Area</strong>
          <p style={{ margin: '8px 0 0' }}>
            {selectedArea.areaKm} km² ({selectedArea.areaSqM} m²)
          </p>
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '200px',
          zIndex: 1000,
        }}
      >
        <strong>Map Controls</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: '16px' }}>
          <li>Use drawing tools to create boundaries</li>
          <li>Click markers to view properties</li>
          <li>Zoom and pan with mouse/touch</li>
          <li>Area measured in km² and m²</li>
        </ul>
      </div>
    </div>
  );
}
