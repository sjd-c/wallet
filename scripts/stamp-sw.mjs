// Stamps a unique cache name into out/sw.js so every build triggers the update banner.
import { readFileSync, writeFileSync } from 'node:fs';

const file = 'out/sw.js';
const version = Date.now().toString(36);
writeFileSync(file, readFileSync(file, 'utf8').replaceAll('__BUILD_ID__', version));
console.log('sw.js cache version:', version);
