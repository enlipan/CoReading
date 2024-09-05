console.log("Content script loaded");

// Import Readability (you'll need to include this in your webpack config)
import { Readability } from '@mozilla/readability';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageContent") {
    sendResponse({ html: document.documentElement.outerHTML, url: window.location.href });
  } else if (request.action === "parseContentInPage") {
    const article = extractMainContent(request.html);
    sendResponse({ parsedContent: article });
  }
  return true; // Indicates that the response will be sent asynchronously
});

function extractMainContent(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const reader = new Readability(doc);
  const article = reader.parse();

  if (article) {
    // Remove images and their captions
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content;
    
    // Remove images
    tempDiv.querySelectorAll('img').forEach(img => img.remove());
    
    // Remove figure elements (often used for image captions)
    tempDiv.querySelectorAll('figure').forEach(figure => figure.remove());
    
    // Remove captions
    tempDiv.querySelectorAll('figcaption').forEach(caption => caption.remove());

    return {
      title: article.title,
      byline: article.byline,
      content: tempDiv.innerHTML,
      textContent: article.textContent,
      length: article.length,
      excerpt: article.excerpt
    };
  } else {
    return { error: "Could not extract main content" };
  }
}