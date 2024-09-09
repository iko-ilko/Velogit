import dotenv from '../packages/node_modules/dotenv/lib/main.js';
import { exec } from 'child_process';
import { stat } from 'fs/promises';

import { post } from './post.js';
// import { sync } from './sync.js';

dotenv.config({ path: '.env' });
const env = { BASE_URL: process.env.BASE_URL };

const commands = {
  post: post,
//   sync: sync
};

async function executeCommand(command, filepath) {
  if (commands[command]) {
    await commands[command](filepath);
  } else {
    console.error(`Error: Invalid command - ${command}`);
    process.exit(1);
  }
}

async function main() {
  const [command, filepath] = process.argv.slice(2);
  
  try {
    await setSymbolicLinkProfile();
    await executeCommand(command, filepath);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();


async function setSymbolicLinkProfile() {
    try {
      await stat(`${env.BASE_URL}/srcs/chrome_profile`);
    } catch (error) {
      return new Promise((resolve, reject) => {
        const command = `ln -s /Users/ilsung/Library/Application\\ Support/Google/Chrome ${env.BASE_URL}/srcs/chrome_profile`;
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing command: ${error}`);
            return reject(error);
          }
          console.log('alraedy chrome_porifle');
          resolve();
        });
      });
    }
  }