import { marked } from 'marked';

export function setupPageContentPanel() {
  const pageContentIcon = document.getElementById('page-content-icon');
  const closePageContent = document.getElementById('close-page-content');

  pageContentIcon.addEventListener('click', togglePageContentPanel);
  closePageContent.addEventListener('click', togglePageContentPanel);
}

export function updatePageContentIcon(isActive) {
  const pageContentIcon = document.getElementById('page-content-icon');
  if (isActive) {
    pageContentIcon.classList.add('active');
    pageContentIcon.style.pointerEvents = 'auto';
  } else {
    pageContentIcon.classList.remove('active');
    pageContentIcon.style.pointerEvents = 'none';
  }
}

export function displayPageContent(content) {
  const pageContentDisplay = document.getElementById('page-content-display');
  pageContentDisplay.innerHTML = '';

  if (content.title) {
    const titleElement = document.createElement('h1');
    titleElement.textContent = content.title;
    pageContentDisplay.appendChild(titleElement);
  }

  if (content.byline) {
    const bylineElement = document.createElement('p');
    bylineElement.textContent = content.byline;
    bylineElement.className = 'byline';
    pageContentDisplay.appendChild(bylineElement);
  }

  if (content.excerpt) {
    const excerptElement = document.createElement('blockquote');
    excerptElement.innerHTML = `<strong>Excerpt:</strong> ${content.excerpt}`;
    excerptElement.className = 'excerpt';
    pageContentDisplay.appendChild(excerptElement);
  }

  if (content.content) {
    const articleContent = document.createElement('div');
    // Check if the content is already HTML
    if (/<[a-z][\s\S]*>/i.test(content.content)) {
      articleContent.innerHTML = content.content;
    } else {
      articleContent.innerHTML = marked(content.content);
    }
    pageContentDisplay.appendChild(articleContent);
  }
}

function togglePageContentPanel() {
  const pageContentPanel = document.getElementById('page-content-panel');
  if (pageContentPanel) {
    pageContentPanel.classList.toggle('visible');
  } else {
    console.error('Page Extracted content panel element not found');
  }
}