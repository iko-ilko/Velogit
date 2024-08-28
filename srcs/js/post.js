async function importModules() {
  const puppeteer = (await import('../packages/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')).default;
  return { puppeteer};
}
async function main() {
  const { puppeteer } = await importModules();

(async () => { 
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // defaultViewport : {
    //   width: 1920,
    //   height: 1080
    // },
    headless : false,
    args: [
      '--user-data-dir=/Users/ilsung/Velogit/srcs/chrome_profile',
      '--profile-directory=Default',
      // '--no-first-run',
      // '--no-default-browser-check',
      '--disable-blink-features=AutomationControlled', // 이 옵션으로 자동화된 프로그램 무시하고 구글 로그인 성공
  ]
    });

  const page = (await browser.pages())[0];

  // if 로그인 안돼있으면
  // await page.goto('https://v3.velog.io/api/auth/v3/social/redirect/google?next=&amp;isIntegrate=0');
  // else
  // await page.goto('https://velog.io'); 

  // 로그인 된 상황
  await page.goto('https://velog.io/write');

  // await browser.close(); // 브라우저 종료
})();
}

main().catch(console.error);
