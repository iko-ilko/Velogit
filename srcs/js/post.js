import puppeteer from '../packages/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import { MarkdownParser } from './markdown-parser.js';


export async function post(filepath) {

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

  await postToVelog(page);

})();
}

// post().catch(console.error);


async function checkDoLogin(page) {
  if (page.url() === "https://velog.io/")
    return ;

  console.log("Not logged in, waiting for user to log in...");
  
  await page.waitForFunction(
    'window.location.href === "https://velog.io/"',
    { timeout: 0 }
  );
}

async function postToVelog(page) {
    await page.goto('https://v3.velog.io/api/auth/v3/social/redirect/google?next=&amp;isIntegrate=0');
    await checkDoLogin(page);
    console.log("velog is loggined");

    await page.goto('https://velog.io/write');
}