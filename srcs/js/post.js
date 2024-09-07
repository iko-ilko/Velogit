import dotenv from '../packages/node_modules/dotenv/lib/main.js';
import puppeteer from '../packages/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import { exec } from 'child_process';
import { stat } from 'fs/promises';

dotenv.config({ path: '../../.env' });
const env = { BASE_URL: process.env.BASE_URL};

async function main() {
  await setSymbolicLinkProfile();

(async () => { 
  const browser = await puppeteer.launch({
    // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // defaultViewport : {
    //   width: 1920,
    //   height: 1080
    // },
    headless : false,
    args: [
      '--user-data-dir=/Users/ilsung/Velogit/srcs/chrome_profile',
      '--profile-directory=Default',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-blink-features=AutomationControlled', // 이 옵션으로 자동화된 프로그램 무시하고 구글 로그인 성공
  ]
    });

  const page = (await browser.pages())[0];

  // if 로그인 안돼있으면
  await page.goto('https://v3.velog.io/api/auth/v3/social/redirect/google?next=&amp;isIntegrate=0');
  await checkDoLogin(page);
  console.log("velog is loggined");
  // else
  // await page.goto('https://velog.io'); 

  // 로그인 된 상황
  // await page.goto('https://velog.io/write');

  // await browser.close(); // 브라우저 종료
})();
}

main().catch(console.error);

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


async function checkDoLogin(page) {
  if (page.url() === "https://velog.io/")
    return ;

  console.log("Not logged in, waiting for user to log in...");
  
  await page.waitForFunction(
    'window.location.href === "https://velog.io/"',
    { timeout: 0 }
  );
}