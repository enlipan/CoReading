import { refreshContent } from './sidebar';
import { saveConfiguration } from './config';
import { getGeminiResponse } from './aiService';
import { marked } from 'marked';

export function setupConfigEvent() {
  setupConfigEventListeners();
}

export function setupSidebarEvent() {
  setupSidebarEventListeners();
  setupChromeEventListeners();
}

function setupSidebarEventListeners() {
  const refreshButton = document.getElementById('refresh-button');
  const sendButton = document.getElementById('send-button');
  const settingsButton = document.getElementById('settings-button');
  const chatInput = document.getElementById('chat-input');
  const pageContentIcon = document.getElementById('page-content-icon');

  if (refreshButton) refreshButton.addEventListener('click', refreshContent);
  if (sendButton) sendButton.addEventListener('click', handleSendButton);
  if (settingsButton) settingsButton.addEventListener('click', () => chrome.runtime.openOptionsPage());
  if (chatInput) chatInput.addEventListener('keypress', handleChatInputKeypress);
  if (pageContentIcon) pageContentIcon.addEventListener('click', togglePageContentPanel);
}

function setupConfigEventListeners() {
  const saveConfigButton = document.getElementById('save-config');
  const addShortcutButton = document.getElementById('add-shortcut');

  if (saveConfigButton) saveConfigButton.addEventListener('click', saveConfiguration);
  if (addShortcutButton) addShortcutButton.addEventListener('click', handleAddShortcut);
}

function setupChromeEventListeners() {
  chrome.runtime.onMessage.addListener(handleRuntimeMessage);
  chrome.action.onClicked.addListener(handleActionClicked);
}

async function handleSendButton() {
  const chatInput = document.getElementById('chat-input');
  const conversationArea = document.getElementById('conversation-area');

  if (chatInput) {
    const userInput = chatInput.value.trim();
    if (userInput) {
      // Clear the input
      chatInput.value = '';

      // Display user message
      appendMessage('user', userInput, conversationArea);

      try {
        // Get the article content
        const articleContent = document.getElementById('page-content-display').innerText;

        // Get the user prompt from storage
        const { userPrompt } = await chrome.storage.sync.get(['userPrompt']);

        // Combine user prompt, article content, and user input
        const fullPrompt = `${userPrompt}\n\nArticle content: ${articleContent}\n\nUser question: ${userInput}`;

        // Get AI response
        const aiResponse = await getGeminiResponse(fullPrompt);

        // Display AI response with markdown support
        appendMessage('ai', aiResponse, conversationArea, true);
      } catch (error) {
        console.error('Error getting AI response:', error);
        appendMessage('error', 'Sorry, there was an error processing your request.', conversationArea);
      }
    }
  }
}

function appendMessage(sender, message, container, useMarkdown = false) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}-message`;

  if (useMarkdown) {
    messageElement.innerHTML = marked(message);
  } else {
    messageElement.textContent = message;
  }

  container.appendChild(messageElement);
  container.scrollTop = container.scrollHeight;
}

function handleChatInputKeypress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSendButton();
  }
}

function handleAddShortcut() {
  const result = prompt('Enter shortcut and prompt (format: /shortcut | Prompt text):');
  if (result) {
    const [key, value] = result.split('|').map(item => item.trim());
    if (key && value) {
      addShortcutToTable(key, value);
    } else {
      alert('Invalid format. Please use: /shortcut | Prompt text');
    }
  }
}

function handleRuntimeMessage(request, sender, sendResponse) {
  console.log("Received message:", request);
  if (request.action === "updateContent") {
    console.log("Updating content");
    document.getElementById('page-content-display').innerHTML = request.content;
  } else if (request.action === "extractionError") {
    console.error('Error extracting content:', request.error);
    displayError(request.error);
  }
}

function handleActionClicked(tab) {
  console.log('Action clicked');
  chrome.sidePanel.open({ tabId: tab.id })
    .then(() => {
      console.log('Side panel opened');
      chrome.tabs.sendMessage(tab.id, { action: "getPageContent" });
    })
    .catch((error) => {
      console.error('Error opening side panel:', error);
    });
}

function addShortcutToTable(key, value) {
  const table = document.getElementById('prompt-shortcuts');
  const newRow = table.insertRow(-1);
  newRow.innerHTML = `
    <td>${key}</td>
    <td>${value}</td>
    <td>
      <button class="icon-button edit-shortcut"><span class="material-icons">edit</span></button>
      <button class="icon-button delete-shortcut"><span class="material-icons">delete</span></button>
    </td>
  `;
  addShortcutListeners();
}

function addShortcutListeners() {
  document.querySelectorAll('.edit-shortcut').forEach(button => {
    button.addEventListener('click', editShortcut);
  });
  document.querySelectorAll('.delete-shortcut').forEach(button => {
    button.addEventListener('click', deleteShortcut);
  });
}

function editShortcut(e) {
  const row = e.target.closest('tr');
  const currentKey = row.cells[0].textContent;
  const currentValue = row.cells[1].textContent;
  const result = prompt('Edit shortcut and prompt (format: /shortcut | Prompt text):', `${currentKey} | ${currentValue}`);
  if (result) {
    const [key, value] = result.split('|').map(item => item.trim());
    if (key && value) {
      row.cells[0].textContent = key;
      row.cells[1].textContent = value;
    } else {
      alert('Invalid format. Please use: /shortcut | Prompt text');
    }
  }
}

function deleteShortcut(e) {
  if (confirm('Are you sure you want to delete this shortcut?')) {
    e.target.closest('tr').remove();
  }
}

function displayError(message) {
  const errorMessage = document.createElement('div');
  errorMessage.textContent = `Error: ${message}`;
  errorMessage.style.color = 'red';
  document.getElementById('conversation-area').innerHTML = '';
  document.getElementById('conversation-area').appendChild(errorMessage);
}

function togglePageContentPanel() {
  const pageContentPanel = document.getElementById('page-content-panel');
  pageContentPanel.classList.toggle('hidden');
}