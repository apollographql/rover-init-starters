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
        required: ['id', 'display_name', 'path', 'language', 'federation_version', 'max_schema_depth', 'routing_url', 'test_commands'],
        properties: {
          id: { type: 'string' },
          display_name: { type: 'string' },
          path: { type: 'string' },
          language: { type: 'string' },
          federation_version: { type: 'string' },
          max_schema_depth: { type: 'number' },
          routing_url: { type: 'string' },
          print_depth: { type: 'number' },
          commands: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          },
          start_point_file: { type: 'string' },
          test_commands: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          }
        }
      }
    }
  }
};

function getTemplateDirectories() {
  const entries = fs.readdirSync('.', { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory() && (entry.name.startsWith('start-with-') || entry.name === 'add-mcp'))
    .map(entry => entry.name);
}

function getTemplateTests() {
  const workflowPath = '.github/workflows/templates-test.yml';
  if (!fs.existsSync(workflowPath)) {
    return [];
  }
  
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  const testMatches = workflowContent.match(/npm run test:template ([^\s]+)/g) || [];
  return testMatches.map(match => {
    const path = match.split(' ')[3];
    return path;
  });
}

async function validateManifest() {
  try {
    // Read and validate manifest.json
    const manifestPath = path.join(__dirname, '..', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Initialize Ajv
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);

    const valid = validate(manifest);
    if (!valid) {
      console.error('Manifest validation failed:');
      console.error(validate.errors);
      return false;
    }

    // Get all template directories
    const templateDirs = getTemplateDirectories();
    console.log('Found template directories:', templateDirs);

    // Get all template paths from manifest
    const manifestPaths = manifest.templates.map(t => t.path);
    console.log('Found manifest entries:', manifestPaths);

    // Get all template paths from tests
    const testPaths = getTemplateTests();
    console.log('Found test entries:', testPaths);

    // Check for directories without manifest entries
    const dirsWithoutManifest = templateDirs.filter(dir => !manifestPaths.includes(dir));
    if (dirsWithoutManifest.length > 0) {
      console.error('Found directories without manifest entries:');
      dirsWithoutManifest.forEach(dir => console.error(`   - ${dir}`));
      return false;
    }

    // Check for manifest entries without directories
    const manifestWithoutDirs = manifestPaths.filter(path => !templateDirs.includes(path));
    if (manifestWithoutDirs.length > 0) {
      console.error('Found manifest entries without directories:');
      manifestWithoutDirs.forEach(path => console.error(`   - ${path}`));
      return false;
    }

    // Check for templates without tests
    const templatesWithoutTests = manifestPaths.filter(path => !testPaths.includes(path));
    if (templatesWithoutTests.length > 0) {
      console.error('Found templates without tests:');
      templatesWithoutTests.forEach(path => console.error(`   - ${path}`));
      return false;
    }

    // Check for tests without templates
    const testsWithoutTemplates = testPaths.filter(path => !manifestPaths.includes(path));
    if (testsWithoutTemplates.length > 0) {
      console.error('Found tests for non-existent templates:');
      testsWithoutTemplates.forEach(path => console.error(`   - ${path}`));
      return false;
    }

    console.log('All templates have corresponding directories, manifest entries, and tests!');
    return true;
  } catch (error) {
    console.error('Error validating manifest:', error.message);
    return false;
  }
}

validateManifest().then(isValid => {
  if (!isValid) {
    process.exit(1);
  }
}); 