import { setupEventListeners } from './eventHandlers';

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

export function displayUserPrompt(prompt) {
  const userPromptElement = document.createElement('div');
  userPromptElement.className = 'user-prompt';
  userPromptElement.textContent = `User: ${prompt}`;
  document.getElementById('content-display').appendChild(userPromptElement);

  const aiResponseElement = document.createElement('div');
  aiResponseElement.className = 'ai-response';
  aiResponseElement.textContent = 'AI: This is a placeholder response. Implement your AI logic here.';
  document.getElementById('content-display').appendChild(aiResponseElement);

  document.getElementById('content-display').scrollTop = document.getElementById('content-display').scrollHeight;
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
    } else {
      console.log("Content parsed successfully:", response.result);
      displayContent(response.result);
    }
  });
}

function displayContent(content) {
  document.getElementById('content-display').innerHTML = content;
}

function displayError(message) {
  const errorMessage = document.createElement('div');
  errorMessage.textContent = `Error: ${message}`;
  errorMessage.style.color = 'red';
  document.getElementById('content-display').innerHTML = '';
  document.getElementById('content-display').appendChild(errorMessage);
}

document.addEventListener('DOMContentLoaded', setupEventListeners);