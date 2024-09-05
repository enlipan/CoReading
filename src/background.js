console.log('Background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  console.log('Action clicked');
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  if (request.action === "parseContent") {
    console.log("Received parseContent request");
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        const activeTab = tabs[0];
        console.log("Active tab found:", activeTab.id);
        chrome.tabs.sendMessage(activeTab.id, { action: "parseContentInPage", html: request.html }, (result) => {
          if (chrome.runtime.lastError) {
            console.error("Error parsing content:", chrome.runtime.lastError);
            sendResponse({ error: chrome.runtime.lastError.message });
          } else {
            console.log("Parse result:", result);
            sendResponse({ success: true, result: result });
          }
        });
      } else {
        console.error("No active tab found");
        sendResponse({ error: "No active tab found" });
      }
    });

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});

console.log('Background script setup complete');
