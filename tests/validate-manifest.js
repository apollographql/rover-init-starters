const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

// Define the schema for manifest.json
const schema = {
  type: 'object',
  required: ['templates'],
  properties: {
    templates: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'display_name', 'path', 'language', 'federation_version', 'max_schema_depth', 'routing_url'],
        properties: {
          id: { type: 'string' },
          display_name: { type: 'string' },
          path: { type: 'string' },
          language: { type: 'string' },
          federation_version: { type: 'string' },
          max_schema_depth: { type: 'number' },
          routing_url: { type: 'string' },
          print_depth: { type: 'number' },
          command: { type: 'string' },
          start_point_file: { type: 'string' }
        }
      }
    }
  }
};

// Initialize Ajv
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

// Read and validate manifest.json
const manifestPath = path.join(__dirname, '..', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const valid = validate(manifest);

if (!valid) {
  console.error('Validation failed:');
  console.error(validate.errors);
  process.exit(1);
} else {
  console.log('✅ manifest.json is valid!');
} 