import puppeteer from '../packages/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import { readFile } from 'fs/promises';
import { MarkdownParser } from './markdown-parser.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
  
  try {
    const content = await readFile(filepath, 'utf-8');
    const localMd = new MarkdownParser(content);
    localMd.init(page);

    await postToVelog(page, localMd);
  } catch (error) {
    console.error('Error posting to Velog: ', error);
  } finally {
    // await browser.close();
  }

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

async function postToVelog(page, localMd) {
  await page.goto('https://v3.velog.io/api/auth/v3/social/redirect/google?next=&amp;isIntegrate=0');
  await checkDoLogin(page);
  console.log("velog is logged in");

  await page.goto('https://velog.io/write');

  // 여기에 markdownParser를 사용하여 제목, 내용, 태그 등을 입력하는 로직 추가
  
  await page.type('textarea[placeholder="제목을 입력하세요"]', localMd.getTitle());
  console.log("title: " + localMd.getTitle());

  await sleep(5000);
  // 태그 입력
  for (const tag of localMd.getTags()) {
    await page.type('input[placeholder="태그를 입력하세요"]', tag);
    await page.keyboard.press('Enter');
  }
  console.log("tags: " + localMd.getTags());

  // 내용 입력 (CodeMirror 에디터 사용 가정)
  await page.evaluate((content) => {
    const editor = document.querySelector('.CodeMirror').CodeMirror;
    editor.setValue(content);
  }, localMd.getContent());  

  console.log("Post content filled");
  // 여기에 발행 버튼 클릭 로직 추가
}