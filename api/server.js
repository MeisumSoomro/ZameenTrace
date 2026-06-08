const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for parcels (replace with PostGIS later)
let parcels = [];

// API Routes

// Get all parcels
app.get('/api/parcels', (req, res) => {
  res.json(parcels);
});

// Get parcel by ID
app.get('/api/parcels/:id', (req, res) => {
  const parcel = parcels.find(p => p.id === req.params.id);
  if (!parcel) {
    return res.status(404).json({ error: 'Parcel not found' });
  }
  res.json(parcel);
});

// Create new parcel
app.post('/api/parcels', (req, res) => {
  const { parcelId, farmerName, village, description, coordinates } = req.body;

  if (!parcelId || !farmerName || !coordinates || coordinates.length < 3) {
    return res.status(400).json({ error: 'Missing required fields or insufficient coordinates' });
  }

  const newParcel = {
    id: uuidv4(),
    parcelId,
    farmerName,
    village,
    description,
    coordinates,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    area: calculateArea(coordinates),
    perimeter: calculatePerimeter(coordinates)
  };

  parcels.push(newParcel);
  res.status(201).json(newParcel);
});

// Update parcel
app.put('/api/parcels/:id', (req, res) => {
  const parcelIndex = parcels.findIndex(p => p.id === req.params.id);
  if (parcelIndex === -1) {
    return res.status(404).json({ error: 'Parcel not found' });
  }

  const updatedParcel = {
    ...parcels[parcelIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  parcels[parcelIndex] = updatedParcel;
  res.json(updatedParcel);
});

// Delete parcel
app.delete('/api/parcels/:id', (req, res) => {
  const parcelIndex = parcels.findIndex(p => p.id === req.params.id);
  if (parcelIndex === -1) {
    return res.status(404).json({ error: 'Parcel not found' });
  }

  parcels.splice(parcelIndex, 1);
  res.json({ message: 'Parcel deleted' });
});

// Helper functions for area and perimeter calculation
function calculateArea(coordinates) {
  // Simple polygon area calculation using shoelace formula
  let area = 0;
  const n = coordinates.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i][0] * coordinates[j][1];
    area -= coordinates[j][0] * coordinates[i][1];
  }
  area = Math.abs(area) / 2;
  return area;
}

function calculatePerimeter(coordinates) {
  let perimeter = 0;
  const n = coordinates.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = coordinates[j][0] - coordinates[i][0];
    const dy = coordinates[j][1] - coordinates[i][1];
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return perimeter;
}

app.listen(PORT, () => {
  console.log(`ZameenTrace API scaffold running on http://localhost:${PORT}`);
});
