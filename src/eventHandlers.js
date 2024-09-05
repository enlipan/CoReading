import { refreshContent, displayUserPrompt } from './sidebar';
import { saveConfiguration, loadConfiguration } from './config';

export function setupEventListeners() {
  // Sidebar event listeners
  document.getElementById('refresh-button').addEventListener('click', refreshContent);
  document.getElementById('send-button').addEventListener('click', handleSendButton);
  document.getElementById('settings-button').addEventListener('click', () => chrome.runtime.openOptionsPage());
  document.getElementById('chat-input').addEventListener('keypress', handleChatInputKeypress);

  // Config page event listeners
  document.getElementById('save-config')?.addEventListener('click', saveConfiguration);
  document.getElementById('add-shortcut')?.addEventListener('click', handleAddShortcut);

  // Chrome extension event listeners
  chrome.runtime.onMessage.addListener(handleRuntimeMessage);
  chrome.action.onClicked.addListener(handleActionClicked);
}

function handleSendButton() {
  const chatInput = document.getElementById('chat-input');
  const userInput = chatInput.value.trim();
  if (userInput) {
    displayUserPrompt(userInput);
    chatInput.value = '';
  }
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
    document.getElementById('content-display').innerHTML = request.content;
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
  document.getElementById('content-display').innerHTML = '';
  document.getElementById('content-display').appendChild(errorMessage);
}