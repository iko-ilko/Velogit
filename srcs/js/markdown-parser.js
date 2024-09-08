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

  parse() {
    const [frontMatter, ...contentParts] = this.markdown.split('---\n');
    this.parseFrontMatter(frontMatter);
    this.content = contentParts.join('---\n').trim();
  }

  parseFrontMatter(frontMatter) {
    const lines = frontMatter.trim().split('\n');
    lines.forEach(line => {
      const [key, value] = line.split(':').map(part => part.trim());
      if (key && value) {
        switch (key) {
          case 'title':
            this.title = value.replace(/"/g, '');
            break;
          case 'tags':
            this.tags = value.replace(/[\[\]"]/g, '').split(',').map(tag => tag.trim());
            break;
          case 'series':
            this.series = value.replace(/"/g, '');
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