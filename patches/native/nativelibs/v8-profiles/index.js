/* patched for Linux */
let binding = null;
try {
  if (process.platform === 'win32') {
    binding = process.arch === 'ia32'
      ? require('./profiler_electron1.8_win32_ia32.node')
      : require('./profiler_electron1.8_win32_x64.node');
  } else if (process.platform === 'darwin') {
    binding = require('./profiler_electron1.8_mac.node');
  }
} catch(e) {
  binding = null;
}

if (!binding) {
  // Stub profiler for unsupported platforms
  binding = {
    cpu: {
      profiles: {},
      startProfiling: () => {},
      stopProfiling: () => ({ startTime: Date.now(), endTime: Date.now(), delete: () => {} }),
      setSamplingInterval: () => {},
    }
  };
}

function CpuProfile() {}
CpuProfile.prototype.getHeader = function() {
  return { typeId: this.typeId, uid: this.uid, title: this.title }
}

var activeProfiles = [];
var startTime, endTime;

var profiler = {
  get profiles() { return binding.cpu.profiles; },
  startProfiling: function(name, recsamples) {
    if (typeof name === 'boolean') { recsamples = name; name = ''; }
    name = '' + (name || '');
    if (activeProfiles.indexOf(name) < 0) activeProfiles.push(name);
    startTime = Date.now();
    binding.cpu.startProfiling(name, recsamples !== false);
  },
  stopProfiling: function(name) {
    var index = activeProfiles.indexOf(name);
    if (name && index < 0) return;
    var profile = binding.cpu.stopProfiling(name);
    endTime = Date.now();
    if (profile) profile.__proto__ = CpuProfile.prototype;
    if (profile && !profile.startTime) profile.startTime = startTime;
    if (profile && !profile.endTime) profile.endTime = endTime;
    if (name) activeProfiles.splice(index, 1);
    else if (activeProfiles.length) activeProfiles.length--;
    return profile;
  },
  setSamplingInterval: function(num) {
    if (activeProfiles.length) throw new Error('setSamplingInterval must be called when there are no profiles being recorded.');
    num = parseInt(num, 10) || 1000;
    binding.cpu.setSamplingInterval(num);
  },
  deleteAllProfiles: function() {
    Object.keys(binding.cpu.profiles).forEach(key => binding.cpu.profiles[key].delete());
  }
};

module.exports = profiler;
process.profiler = profiler;
