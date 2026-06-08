import { appConfig } from '@/lib/config';

export const fallbackParcels = [
  {
    id: 'sample-1',
    parcelId: 'ZT-PK-SND-0421',
    ownerName: 'Ali Khan',
    district: 'Tando Allahyar',
    village: 'Mir Wah',
    status: 'verified',
    areaSqm: 18420,
    boundary: {
      type: 'Polygon',
      coordinates: [
        [
          [68.7146, 25.4621],
          [68.717, 25.462],
          [68.7174, 25.4637],
          [68.7149, 25.4641],
          [68.7146, 25.4621],
        ],
      ],
    },
  },
  {
    id: 'sample-2',
    parcelId: 'ZT-PK-SND-0422',
    ownerName: 'Mehran Bux',
    district: 'Tando Allahyar',
    village: 'Chamber',
    status: 'pending_verification',
    areaSqm: 12630,
    boundary: {
      type: 'Polygon',
      coordinates: [
        [
          [68.7172, 25.4614],
          [68.7188, 25.4613],
          [68.7191, 25.4627],
          [68.7174, 25.4628],
          [68.7172, 25.4614],
        ],
      ],
    },
  },
  {
    id: 'sample-3',
    parcelId: 'ZT-PK-SND-0423',
    ownerName: 'Shazia Memon',
    district: 'Tando Allahyar',
    village: 'Nasarpur Road',
    status: 'draft',
    areaSqm: 9320,
    boundary: {
      type: 'Polygon',
      coordinates: [
        [
          [68.7133, 25.4608],
          [68.7148, 25.4607],
          [68.715, 25.462],
          [68.7134, 25.4621],
          [68.7133, 25.4608],
        ],
      ],
    },
  },
];

export async function fetchRegionalParcels(filters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const response = await fetch(
    `${appConfig.apiBaseUrl}/parcels?${params.toString()}`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch parcels');
  }

  return response.json();
}

export async function submitBoundaryUpdate(parcelId, payload, token) {
  const response = await fetch(
    `${appConfig.apiBaseUrl}/parcels/${parcelId}/boundary`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to submit boundary update');
  }

  return response.json();
}

export async function submitVerification(parcelId, payload, token) {
  const response = await fetch(
    `${appConfig.apiBaseUrl}/parcels/${parcelId}/verify`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to submit verification');
  }

  return response.json();
}
