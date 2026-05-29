"use strict";
let addon;
try {
  if (process.platform === 'darwin') {
    addon = require(`../prebuilt/darwin/electron/${process.arch}/db-cross-v4-native.node`);
  } else if (process.platform === 'linux') {
    const linuxPath = `../prebuilt/linux/electron/${process.arch}/db-cross-v4-native.node`;
    const { existsSync } = require('fs');
    const { join } = require('path');
    const full = join(__dirname, linuxPath);
    if (existsSync(full)) {
      addon = require(full);
    } else {
      addon = null;
    }
  } else {
    if (process.arch === 'x64') {
      addon = require('../prebuilt/window/electron_x86_64/db-cross-v4-native.node');
    } else {
      addon = require('../prebuilt/window/electron_x86/db-cross-v4-native.node');
    }
  }
} catch(e) {
  console.warn('[db-cross-v4] Failed to load native module:', e.message);
  addon = null;
}
module.exports = addon;
