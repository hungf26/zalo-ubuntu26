/* patched for Linux */
const { existsSync } = require('fs')
const { join } = require('path')
const { platform, arch } = process

let nativeBinding = null
let loadError = null

function getPlatformPath() {
  switch (platform) {
    case 'win32':
      switch (arch) {
        case 'x64': return join(__dirname, 'x64', 'file-utilities.node')
        case 'ia32': return join(__dirname, 'ia32', 'file-utilities.node')
        default: return null
      }
    case 'darwin':
      switch (arch) {
        case 'x64': return join(__dirname, 'darwin', 'file-utilities.node')
        case 'arm64': return join(__dirname, 'darwin-arm', 'file-utilities.node')
        default: return null
      }
    case 'linux':
      // Try linux-x64 if available
      return join(__dirname, 'linux-x64', 'file-utilities.node')
    default:
      return null
  }
}

try {
  const bindingPath = getPlatformPath()
  if (bindingPath && existsSync(bindingPath)) {
    nativeBinding = require(bindingPath)
  }
} catch (e) {
  loadError = e
}

const noop = () => Promise.resolve({ size: 0, fileCount: 0, directoryCount: 0 })
const noopSync = () => ({ size: 0, fileCount: 0, directoryCount: 0 })

if (!nativeBinding) {
  module.exports = {
    getDirectorySizeSync: noopSync,
    getDirectorySizeAsync: noop,
    detectHardlinksSync: () => false,
    detectHardlinksAsync: () => Promise.resolve(false),
    detectFilesystemSync: () => 'unknown',
    detectFilesystemAsync: () => Promise.resolve('unknown'),
    getDirectorySizeByGlobSync: noopSync,
    getDirectorySizeByGlobAsync: noop,
    cancelJob: () => {},
  }
} else {
  module.exports = nativeBinding
}
