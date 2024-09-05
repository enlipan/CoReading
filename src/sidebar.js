import { setupSidebarEvent } from './eventHandlers';
import { initializeGeminiAI } from './aiService';
import { setupPageContentPanel, updatePageContentIcon, displayPageContent } from './pageContent';

export function refreshContent() {
  console.log("Refreshing content");
  
  // Clear the conversation area
  const conversationArea = document.getElementById('conversation-area');
  if (conversationArea) {
    conversationArea.innerHTML = '';
  }

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
          console.log("Received page extracted content:", response);
          parseContent(response.html, response.url);
        }
      });
    } else {
      console.error("No active tab found");
      displayError("No active tab found. Please open a webpage and try again.");
    }
  });

  // Reset the chat input
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.value = '';
  }
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
      displayPageContent(response.result.parsedContent);
      updatePageContentIcon(true);
    } else {
      console.error("Unexpected response:", response);
      displayError("An unexpected error occurred.");
    }
  });
}

function displayError(message) {
  const errorMessage = document.createElement('div');
  errorMessage.textContent = `Error: ${message}`;
  errorMessage.style.color = 'red';
  document.getElementById('conversation-area').innerHTML = '';
  document.getElementById('conversation-area').appendChild(errorMessage);
  updatePageContentIcon(false);
}

async function initializeSidebar() {
  setupSidebarEvent();
  setupPageContentPanel();
  try {
    await initializeGeminiAI();
    console.log('Gemini AI initialized successfully');
  } catch (error) {
    console.error('Error initializing Gemini AI:', error);
    displayError('Failed to initialize AI. Please check your API key in the settings.');
  }
}

document.addEventListener('DOMContentLoaded', initializeSidebar);