import { setupSidebarEvent } from './eventHandlers';

export function refreshContent() {
  console.log("Refreshing content");
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      console.log("Sending getPageContent message to tab:", tabs[0].id);
      chrome.tabs.sendMessage(tabs[0].id, { action: "getPageContent" }, function (response) {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError);
          if (chrome.runtime.lastError.message.includes("Could not establish connection")) {
            console.log("Content script not loaded. Injecting content script...");
            injectContentScript(tabs[0].id);
          } else {
            displayError("An error occurred while communicating with the page.");
          }
        } else {
          console.log("Received page content:", response);
          parseContent(response.html, response.url);
        }
      });
    } else {
      console.error("No active tab found");
      displayError("No active tab found. Please open a webpage and try again.");
    }
  });
}

function injectContentScript(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['dist/content.bundle.js']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error injecting content script:", chrome.runtime.lastError);
      displayError("Failed to inject content script. Please refresh the page and try again.");
    } else {
      console.log("Content script injected successfully");
      setTimeout(refreshContent, 100); // Retry after a short delay
    }
  });
}

function parseContent(html, url) {
  chrome.runtime.sendMessage({ action: "parseContent", html: html, url: url }, function (response) {
    if (chrome.runtime.lastError) {
      console.error("Error parsing content:", chrome.runtime.lastError);
      displayError("An error occurred while parsing the content.");
    } else if (response.error) {
      console.error("Error in parse response:", response.error);
      displayError(response.error);
    } else if (response.success) {
      console.log("Content parsed successfully:", response.result);
      displayContent(response.result.parsedContent);
    } else {
      console.error("Unexpected response:", response);
      displayError("An unexpected error occurred.");
    }
  });
}
function displayContent(content) {
  const contentDisplay = document.getElementById('content-display');
  contentDisplay.innerHTML = '';

  if (content.title) {
    const titleElement = document.createElement('h1');
    titleElement.textContent = content.title;
    contentDisplay.appendChild(titleElement);
  }

  if (content.byline) {
    const bylineElement = document.createElement('p');
    bylineElement.textContent = content.byline;
    bylineElement.className = 'byline';
    contentDisplay.appendChild(bylineElement);
  }

  if (content.excerpt) {
    const excerptElement = document.createElement('blockquote');
    excerptElement.innerHTML = `<strong>Excerpt:</strong> ${content.excerpt}`;
    excerptElement.className = 'excerpt';
    excerptElement.style.fontStyle = 'italic';
    contentDisplay.appendChild(excerptElement);
  }

  if (content.content) {
    const articleContent = document.createElement('div');
    articleContent.innerHTML = content.content;
    contentDisplay.appendChild(articleContent);
  }
}

function displayError(message) {
  const errorMessage = document.createElement('div');
  errorMessage.textContent = `Error: ${message}`;
  errorMessage.style.color = 'red';
  document.getElementById('content-display').innerHTML = '';
  document.getElementById('content-display').appendChild(errorMessage);
}

function initializeChat() {
  chrome.storage.sync.get(['userPrompt'], function (result) {
    const userPrompt = result.userPrompt || "You are a helpful AI assistant.";
    // Use the userPrompt to initialize your chat or LLM interaction
    console.log("Initializing chat with user prompt:", userPrompt);
    // Implement your chat initialization logic here
  });
}

// Call initializeChat when the sidebar is opened or when starting a new conversation
document.addEventListener('DOMContentLoaded', setupSidebarEvent);
document.addEventListener('DOMContentLoaded', initializeChat);