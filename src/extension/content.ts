// Content script injected into all web pages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_SELECTION') {
    const selectedText = window.getSelection()?.toString().trim() || '';
    sendResponse({ text: selectedText });
  }
  return true; // Keep the message channel open for async response
});
