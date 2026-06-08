'use client';

import { useEffect, useRef } from 'react';

export function ParcelMap({ parcels, selectedParcelId, onSelectParcel }) {
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    let mapInstance;
    let cancelled = false;

    async function mountMap() {
      const L = (await import('leaflet')).default;

      if (
        cancelled ||
        !mapRef.current ||
        mapRef.current.dataset.ready === 'true'
      ) {
        return;
      }

      mapInstance = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([25.4626, 68.7172], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapInstance);

      layerRef.current = L.layerGroup().addTo(mapInstance);
      mapRef.current.dataset.ready = 'true';
      mapRef.current.__leaflet_map__ = mapInstance;
    }

    mountMap();

    return () => {
      cancelled = true;
      if (mapInstance) {
        mapInstance.remove();
      } else if (mapRef.current?.__leaflet_map__) {
        mapRef.current.__leaflet_map__.remove();
      }
      if (mapRef.current) {
        mapRef.current.dataset.ready = 'false';
        delete mapRef.current.__leaflet_map__;
      }
    };
  }, []);

  useEffect(() => {
    async function drawParcels() {
      const mapInstance = mapRef.current?.__leaflet_map__;
      if (!mapInstance || !layerRef.current) {
        return;
      }

      const L = (await import('leaflet')).default;
      layerRef.current.clearLayers();

      const bounds = [];

      parcels.forEach((parcel) => {
        const polygonPoints = parcel.boundary?.coordinates?.[0] || [];
        const latLngs = polygonPoints.map(([lng, lat]) => [lat, lng]);

        if (!latLngs.length) {
          return;
        }

        const isSelected = parcel.parcelId === selectedParcelId;
        const polygon = L.polygon(latLngs, {
          color: isSelected ? '#295f4e' : '#85796d',
          weight: isSelected ? 3 : 2,
          fillColor: isSelected ? '#295f4e' : '#c8beb3',
          fillOpacity: isSelected ? 0.28 : 0.12,
        }).addTo(layerRef.current);

        polygon.bindTooltip(parcel.parcelId, {
          permanent: false,
          direction: 'top',
        });

        polygon.on('click', () => onSelectParcel(parcel.parcelId));
        bounds.push(...latLngs);
      });

      if (bounds.length) {
        mapInstance.fitBounds(bounds, { padding: [24, 24] });
      }
    }

    drawParcels();
  }, [parcels, selectedParcelId, onSelectParcel]);

  return <div className="map-frame" ref={mapRef} aria-label="Parcel map" />;
}
