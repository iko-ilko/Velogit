import dotenv from '../packages/node_modules/dotenv/lib/main.js';
import path from 'path';

dotenv.config({ path: '.env' });
const env = { CUR_IMG_DIR: process.env.CUR_IMG_DIR };

export class MarkdownParser {
  constructor(markdown) {
    this.markdown = markdown;
    this.title = '';
    this.tags = [];
    this.series = '';
    this.velog_url = '';
    this.content = '';
    this.parse();
  }
  async init(page) {
    await this.processImages(page);
  }

  async processImages(page) {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let newContent = '';

    for (const match of this.content.matchAll(imageRegex)) {
      const [fullMatch, alt, src] = match;
      newContent += this.content.slice(lastIndex, match.index);
      
      if (src.startsWith('http://') || src.startsWith('https://')) {
        newContent += fullMatch; // 온라인 이미지는 그대로 유지
      } else {
        const fullPath = path.join(env.CUR_IMG_DIR, src);
        try {
          const newUrl = await this.uploadImageWithPuppeteer(page, fullPath);
          newContent += `![${alt}](${newUrl})`;
        } catch (error) {
          console.error(`Failed to upload image ${src}: ${error.message}`);
          newContent += fullMatch; // 업로드 실패 시 원본 유지
        }
      }
      lastIndex = match.index + fullMatch.length;
    }
    newContent += this.content.slice(lastIndex);
    this.content = newContent;
  }

  async uploadImageWithPuppeteer(page, filePath) {
    await page.waitForSelector('button.ql-image', { timeout: 10000 });

    const uploadButton = await page.$('button.ql-image');
    if (!uploadButton) {
      throw new Error('Upload button not found');
    }

    // await uploadButton.click();

    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      uploadButton.click(),
    ]);
    await fileChooser.accept([filePath]);

    // 이미지 업로드 완료 대기
    await page.waitForSelector('img[src^="https://velog.velcdn.com"]', { timeout: 30000 });
    await page.waitForFunction(() => {
      const uploadingText = document.querySelector('.cm-image-alt-text');
      return !uploadingText || !uploadingText.textContent.includes('업로드중');
    }, { timeout: 60000 });

    // 업로드된 이미지 URL 가져오기
    const imageUrl = await page.evaluate(() => {
      const img = document.querySelector('img[src^="https://velog.velcdn.com"]');
      return img ? img.src : null;
    });

    if (!imageUrl) {
      throw new Error('Failed to get uploaded image URL');
    }

    return imageUrl;
  }

  parse() {
    const parts = this.markdown.split(/---\s*\n/);
    if (parts.length >= 3) {
      this.parseFrontMatter(parts[1]);
      this.content = parts.slice(2).join('---\n').trim();
    } else {
      this.content = this.markdown.trim();
    }
  }

  parseFrontMatter(frontMatter) {
    const lines = frontMatter.trim().split('\n');
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':').map(part => part.trim());
      const value = valueParts.join(':').trim();
      if (key && value) {
        switch (key) {
          case 'title':
            this.title = value.replace(/^"(.*)"$/, '$1');
            break;
          case 'tags':
            this.tags = value.replace(/[\[\]]/g, '').split(',').map(tag => tag.trim().replace(/^"(.*)"$/, '$1'));
            break;
          case 'series':
            this.series = value.replace(/^"(.*)"$/, '$1');
            break;
          case 'velog_url':
            this.velog_url = value;
            break;
        }
      }
    });
  }

  getTitle() {
    return this.title;
  }

  getTags() {
    return this.tags;
  }

  getSeries() {
    return this.series;
  }

  getVelogUrl() {
    return this.velog_url;
  }

  getContent() {
    return this.content;
  }

  setVelogUrl(url) {
    this.velog_url = url;
  }

  toString() {
    const frontMatter = [
      '---',
      `title: "${this.title}"`,
      `tags: [${this.tags.map(tag => `"${tag}"`).join(', ')}]`,
      `series: "${this.series}"`,
      `velog_url: ${this.velog_url}`,
      '---'
    ].join('\n');

    return `${frontMatter}\n\n${this.content}`;
  }
}