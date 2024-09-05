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
    
    // Create a promise to handle the asynchronous operations
    const parseContentPromise = new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          const activeTab = tabs[0];
          console.log("Active tab found:", activeTab.id);
          chrome.tabs.sendMessage(activeTab.id, { action: "parseContentInPage", html: request.html }, (result) => {
            if (chrome.runtime.lastError) {
              console.error("Error parsing content:", chrome.runtime.lastError);
              reject(chrome.runtime.lastError.message);
            } else {
              console.log("Parse result:", result);
              resolve(result);
            }
          });
        } else {
          console.error("No active tab found");
          reject("No active tab found");
        }
      });
    });

    // Use the promise to send the response
    parseContentPromise.then(
      (result) => {
        sendResponse({ success: true, result: result });
      },
      (error) => {
        sendResponse({ error: error });
      }
    );

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});

console.log('Background script setup complete');
