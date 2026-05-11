const fs = require('fs');
const path = require('path');
const openapiSpec = require('../src/config/openapi');

const outputPath = path.resolve(__dirname, '../openapi.json');

fs.writeFileSync(outputPath, `${JSON.stringify(openapiSpec, null, 2)}\n`);

console.log(`OpenAPI generado en ${outputPath}`);
