import { setupEventListeners } from './eventHandlers';

export function saveConfiguration() {
  const promptShortcuts = getPromptShortcuts();
  chrome.storage.sync.set({
    llmPrompt: document.getElementById('llm-prompt').value,
    llmEngine: document.getElementById('llm-engine').value,
    llmKey: document.getElementById('llm-key').value,
    language: document.getElementById('language').value,
    fontSize: document.getElementById('font-size').value,
    promptShortcuts: promptShortcuts
  }, function () {
    alert('Configuration saved successfully!');
  });
}

export function loadConfiguration() {
  chrome.storage.sync.get(['llmPrompt', 'llmEngine', 'llmKey', 'language', 'fontSize', 'promptShortcuts'], function (result) {
    const elements = {
      'llm-prompt': result.llmPrompt || '',
      'llm-engine': result.llmEngine || 'openai',
      'llm-key': result.llmKey || '',
      'language': result.language || 'en',
      'font-size': result.fontSize || 'medium'
    };

    Object.keys(elements).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.value = elements[id];
      } else {
        console.warn(`Element with id '${id}' not found`);
      }
    });

    loadPromptShortcuts(result.promptShortcuts || []);
  });
}

function getPromptShortcuts() {
  const table = document.getElementById('prompt-shortcuts');
  const shortcuts = [];
  for (let i = 1; i < table.rows.length; i++) {
    shortcuts.push({
      key: table.rows[i].cells[0].textContent,
      value: table.rows[i].cells[1].textContent
    });
  }
  return shortcuts;
}

function loadPromptShortcuts(shortcuts) {
  const table = document.getElementById('prompt-shortcuts');
  if (!table) {
    console.warn('Element with id "prompt-shortcuts" not found');
    return;
  }

  table.innerHTML = '<tr><th>Shortcut</th><th>Prompt</th><th>Actions</th></tr>';
  shortcuts.forEach((shortcut, index) => {
    const row = table.insertRow(-1);
    row.innerHTML = `
      <td>${shortcut.key}</td>
      <td>${shortcut.value}</td>
      <td>
        <button class="icon-button edit-shortcut" data-index="${index}"><span class="material-icons">edit</span></button>
        <button class="icon-button delete-shortcut" data-index="${index}"><span class="material-icons">delete</span></button>
      </td>
    `;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadConfiguration();
});