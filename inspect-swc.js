const fs = require('fs');
const buf = fs.readFileSync('node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node');
console.log('magic', buf.slice(0,2).toString('ascii'));
const pe = buf.readUInt32LE(0x3c);
console.log('pe offset', pe);
console.log('machine', buf.readUInt16LE(pe + 4).toString(16));
console.log('sections', buf.readUInt16LE(pe + 6));
console.log('opt', buf.readUInt16LE(pe + 24).toString(16));
