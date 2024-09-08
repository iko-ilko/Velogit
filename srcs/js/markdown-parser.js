import dotenv from '../packages/node_modules/dotenv/lib/main.js';
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
    this.processImages();
  }

  processImages() {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    this.content = this.content.replace(imageRegex, (match, alt, src) => {
      if (src.startsWith('http://') || src.startsWith('https://')) {
        // 온라인 이미지는 그대로 유지
        return match;
      } else {
        const newSrc = `${env.CUR_IMG_DIR}/${src}`;
        return `![${alt}](${newSrc})`;
      }
    });
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