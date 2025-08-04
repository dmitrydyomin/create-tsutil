#!/usr/bin/env node

import child_process from 'child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { promisify } from 'node:util';

const exec = promisify(child_process.exec);
const __dirname = import.meta.dirname;

// Get target directory from command line arguments
const [_, __, projectName] = process.argv;
const targetDir = resolve(projectName || '.');

async function main() {
  try {
    // Check if target directory exists
    if (existsSync(targetDir)) {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await rl.question(
        `Directory ${targetDir} already exists. Overwrite? (y/N) `
      );
      rl.close();

      if (answer.toLowerCase() !== 'y') {
        console.log('Aborted.');
        process.exit(1);
      }
    }

    // Copy template files
    const templateDir = join(__dirname, '../template');
    const files = ['nodemon.json', 'tsconfig.json'];

    await Promise.all(
      files.map(async (file) =>
        cp(join(templateDir, file), join(targetDir, file))
      )
    );

    await writeFile(
      join(targetDir, 'package.json'),
      JSON.stringify(
        {
          name: projectName,
          version: '1.0.0',
          description: '',
          main: 'src/index.ts',
          scripts: {
            build: 'tsc',
            dev: 'nodemon',
            start: 'node build',
          },
          keywords: [],
          author: '',
          license: 'ISC',
          type: 'commonjs',
        },
        null,
        2
      )
    );

    await exec('npm i -D typescript ts-node nodemon dotenv', {
      cwd: targetDir,
    });

    await mkdir(join(targetDir, 'src'));
    await writeFile(
      join(targetDir, 'src', 'index.ts'),
      `console.log('Hello world!');\n`
    );

    console.log(`Project created in ${targetDir}`);
  } catch (error) {
    console.error('Error creating project:', error);
    process.exit(1);
  }
}

main();
