// Linux wrapper: runs before the real Zalo asar
const { app, nativeImage } = require('electron');
const path = require('path');

app.setName('Zalo');

// Load the real app
require('./app.asar');
