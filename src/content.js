console.log("Content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageContent") {
    sendResponse({ html: document.documentElement.outerHTML, url: window.location.href });
  }
  return true;
});