#!/usr/bin/env node

const path = require('node:path');
const { promisify } = require('node:util');
const readline = require('node:readline');
const { ChildProcess } = require('node:child_process');
const { cp } = require('node:fs/promises');

const exec = promisify(ChildProcess.exec);

// Get target directory from command line arguments
const [_, __, projectName] = process.argv;
const targetDir = path.resolve(projectName || '.');

async function main() {
  try {
    // Check if target directory exists
    if (fs.existsSync(targetDir)) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise((resolve) => {
        rl.question(
          `Directory ${targetDir} already exists. Overwrite? (y/N) `,
          resolve
        );
      });
      rl.close();

      if (answer.toLowerCase() !== 'y') {
        console.log('Aborted.');
        process.exit(1);
      }
    }

    // Copy template files
    const templateDir = path.join(__dirname, '../template');
    await fs.copy(templateDir, targetDir);

    const files = ['nodemon.json', 'tsconfig.json'];

    await Promise.all(
      files.map(async (file) =>
        cp(path.join(templateDir, file), path.join(targetDir, file))
      )
    );

    await exec('npm init -y', { cwd: targetDir });
    await exec('npm i -D typescript ts-node nodemon dotenv', {
      cwd: targetDir,
    });

    console.log(`Project created in ${targetDir}`);
  } catch (error) {
    console.error('Error creating project:', error);
    process.exit(1);
  }
}

main();
