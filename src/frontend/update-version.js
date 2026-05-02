const fs = require('fs');
const path = require('path');

// Generate version from timestamp: YYYY.MM.DD-HHMM
const now = new Date();
const version = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

// Update version in package.json
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
packageJson.version = version;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

// Create version.ts file for import in React
const versionTs = `// Auto-generated version file - do not edit manually
export const APP_VERSION = '${version}';
export const BUILD_TIMESTAMP = '${now.toISOString()}';
`;

const versionPath = path.join(__dirname, 'src', 'version.ts');
fs.writeFileSync(versionPath, versionTs);

console.log(`✓ Version updated: ${version}`);
