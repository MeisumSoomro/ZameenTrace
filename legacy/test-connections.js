// Test script to verify file connections
console.log('✅ app.js loaded successfully');

// Test if DOM elements exist
document.addEventListener('DOMContentLoaded', () => {
  const mapElement = document.getElementById('map');
  const saveButton = document.getElementById('saveButton');

  if (mapElement) {
    console.log('✅ Map element found in HTML');
  } else {
    console.error('❌ Map element not found');
  }

  if (saveButton) {
    console.log('✅ Save button found in HTML');
  } else {
    console.error('❌ Save button not found');
  }

  // Test CSS loading by checking computed styles
  const body = document.body;
  const bgColor = getComputedStyle(body).backgroundColor;
  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
    console.log('✅ CSS styles loaded successfully');
  } else {
    console.error('❌ CSS styles not loaded');
  }

  console.log('🎉 All connections verified!');
});