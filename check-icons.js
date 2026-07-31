const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// We'll use the canvas npm package approach or just confirm file sizes
// For now just verify files exist
const files = [
  'public/assets/icon-512.png',
  'public/assets/icon-192.png',
  'public/assets/favicon.png',
  'public/assets/logo.png'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const stats = fs.statSync(f);
    console.log(`✅ ${f} - ${stats.size} bytes`);
  } else {
    console.log(`❌ MISSING: ${f}`);
  }
});
