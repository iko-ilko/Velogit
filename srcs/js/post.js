async function importModules() {
  const puppeteer = (await import('../packages/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js')).default;
  const fs = await import('fs/promises');
  const path = await import('path');

  return { puppeteer, fs, path };
}

async function main() {
  const { puppeteer, fs, path } = await importModules();

  const userDataDir = './user_data';
  const cookiesPath = path.join(userDataDir, 'cookies.json');

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: userDataDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // 저장된 쿠키가 있으면 로드
    try {
      const cookiesString = await fs.readFile(cookiesPath, 'utf8');
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
    } catch (error) {
      console.log('No saved cookies found or error loading cookies');
    }

    await page.goto('https://velog.io', { waitUntil: 'networkidle0', timeout: 60000 });

    // 로그인 상태 확인
    const isLoggedIn = await page.evaluate(() => {
      return document.querySelector('.user-info') !== null;
    });

    if (isLoggedIn) {
      console.log('이미 로그인되어 있습니다.');
    } else {
      console.log('로그인이 필요합니다. Google 계정으로 로그인을 시도합니다.');
      await page.waitForSelector('button', { timeout: 5000 });
      const loginButtonFound = await page.$$eval('button', (buttons, text) => {
        const loginButton = buttons.find(button => button.textContent.includes(text));
        if (loginButton) {
          loginButton.click();
          return true;
        }
        return false;
      }, '로그인');
      
      if (!loginButtonFound) {
        throw new Error('로그인 버튼을 찾을 수 없습니다.');
      }

      // Google 로그인 버튼 클릭
      await page.waitForSelector('button.social-btn.google', { timeout: 5000 });
      await page.click('button.social-btn.google');

      // Google 로그인 페이지에서 로그인
      await page.waitForNavigation({ timeout: 10000 });
      await page.type('input[type="email"]', 'your_email@gmail.com');
      await page.click('#identifierNext');
      await page.waitForSelector('input[type="password"]', { visible: true, timeout: 5000 });
      await page.type('input[type="password"]', 'your_password');
      await page.click('#passwordNext');

      // 로그인 결과 확인
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
      
      const loginSuccess = await page.evaluate(() => {
        return document.querySelector('.user-info') !== null;
      });

      if (loginSuccess) {
        console.log('로그인 성공');
        // 쿠키 저장
        const cookies = await page.cookies();
        await fs.writeFile(cookiesPath, JSON.stringify(cookies));
      } else {
        console.log('로그인 실패: 비밀번호가 올바르지 않거나 다른 문제가 발생했습니다.');
      }
    }
  } catch (error) {
    console.error('오류 발생:', error.message);
  }

  // 브라우저를 열어둔 채로 유지
  // await browser.close();
}

main().catch(console.error);

// https://accounts.google.com/v3/signin/identifier?opparams=%253F&dsh=S1109048429%3A1724678738872596&client_id=512153499356-4sg3s216vvqiv5kjfstal7dd2c1gc1an.apps.googleusercontent.com&ddm=0&o2v=2&redirect_uri=https%3A%2F%2Fv3.velog.io%2Fapi%2Fauth%2Fv3%2Fsocial%2Fcallback%2Fgoogle&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&service=lso&state=%7B%22next%22%3A%22%22%2C%22isIntegrate%22%3A0%7D&flowName=GeneralOAuthFlow&continue=https%3A%2F%2Faccounts.google.com%2Fsignin%2Foauth%2Fconsent%3Fauthuser%3Dunknown%26part%3DAJi8hAMIEakJXf4h4jUHCn9sQ6c9BY8HFqq5OqQuMK1zbpvl5p6f1ITL6m7-mTQm57l_rnM18snFtYzi7tmh3Kj_PirwH4rGw9mKpuqsv8ozZV9nemvQj-176n6tylyfAUHWwUcqmHwmCP6rFK_UWZ27Cq7KrNh7aJ_2cbwGHUVAIZRF1zI6567xyfETdVW5VObsxXCy41h6WySYhofRWb31tuvYFi5u5VUFWrxo9Ty2OCrZPZWdGxy7vq2SAYzRnlJy3cfuqAfglIgUZs-Kt_Ua-zaZXL08JBO_dRdlku6YbpNp6Um7Qi-G0dVPX-TWbIDBbaP-69N5Y4W_u4NGVsiIaNm84_P_JlZbmh5-BimHNKi2_FLUJFr67KNHfFMeG-Ht863ez6ZH1sU-V8GEwJOkO5REM2btN9ImGech6W0n7QKsPJpi4oZR24rX5Jf7LPtK_CynyfSjo4sSaVjL3iiN8F5r-jkr-g%26flowName%3DGeneralOAuthFlow%26as%3DS1109048429%253A1724678738872596%26client_id%3D512153499356-4sg3s216vvqiv5kjfstal7dd2c1gc1an.apps.googleusercontent.com%23&app_domain=https%3A%2F%2Fv3.velog.io&rart=ANgoxccoU7AMW42ek8L--ynYkwDhyKmflQYGcL8yrPgqxdTL-Gv7i_RSmgISGRYHmUusnp0W92hxR-NqdAV2OBZ6TKK_Q9ibvHAss-46sSa_bWjRQXYl6Fk
