const path = require('path');
const fs = require('fs');

// __filename is the asar virtual path; map it to the real unpacked dir
const realFile = __filename.replace(/\.asar([\/\\])/, '.asar.unpacked$1');
const realDir = path.dirname(realFile); // = app.asar.unpacked/native/nativelibs/sqlite3/

const BINARY_PATH = path.join(realDir, `binding/napi-v6-${process.platform}-${process.arch}/node_sqlite3.node`);
console.debug('BINARY_PATH (resolved):', BINARY_PATH);

if (!fs.existsSync(BINARY_PATH)) {
  throw new Error(`sqlite3 binary not found at: ${BINARY_PATH}`);
}

// Use process.dlopen to bypass asar virtual FS interception on .node files
const mod = { exports: {} };
process.dlopen(mod, BINARY_PATH);
module.exports = exports = mod.exports;
