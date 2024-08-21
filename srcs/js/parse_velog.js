function parseVelogPost(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 제목 찾기
    const titleElement = doc.querySelector('.head-wrapper h1');
    const title = titleElement ? titleElement.textContent : '';
    
    // 태그 찾기
    const tagElements = doc.querySelectorAll('.head-wrapper a[href^="/tags/"]');
    const tags = Array.from(tagElements).map(el => el.textContent);

    // 본문 내용 찾기
    const contentElement = Array.from(doc.querySelectorAll('div'))
        .find(el => el.className.includes('atom-one'));
    const content = contentElement ? contentElement.innerHTML : '';
    
    console.log("title: ", title);
    console.log("tag: ", tags);
    console.log("content: ", content);
}
//     // 프론트매터 생성
//     const frontMatter = `---
// title: "${title}"
// tags: [${tags.map(tag => `"${tag}"`).join(', ')}]
// ---

// `;

//     // 최종 마크다운 생성
//     const markdown = frontMatter + content;

//     return markdown;
// }

// // 사용 예
// const htmlContent = '... HTML 내용 ...';
// const markdown = parseVelogPost(htmlContent);
// console.log(markdown);