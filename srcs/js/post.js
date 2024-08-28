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

  const page = await browser.newPage(); // 신규 탭(페이지) 생성

  await page.goto('https://velog.io'); // 해당 URL로 이동

  // await browser.close(); // 브라우저 종료
})();
}

main().catch(console.error);
