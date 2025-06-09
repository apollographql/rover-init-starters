const { execSync } = require('child_process');
const path = require('path');

async function runCommands(templatePath, commands) {
  const absolutePath = path.resolve(process.cwd(), templatePath);
  
  console.log(`Running commands in ${templatePath}...`);
  
  try {
    process.chdir(absolutePath);
    
    for (const command of commands) {
      console.log(`\nRunning: ${command}`);
      try {
        const output = execSync(command, { stdio: 'inherit' });
        console.log('Command completed successfully');
      } catch (error) {
        console.error(`Command failed: ${command}`);
        console.error(error.message);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error running commands in ${templatePath}:`, error.message);
    return false;
  }
}

// Get the template path and commands from command line arguments
const templatePath = process.argv[2];
const commands = process.argv.slice(3);

if (!templatePath || commands.length === 0) {
  console.error('Please provide a template path and at least one command to run');
  process.exit(1);
}

runCommands(templatePath, commands).then(success => {
  if (!success) {
    process.exit(1);
  }
}); 