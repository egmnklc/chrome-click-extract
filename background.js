console.log("Sending message to background.js: startHighlighting");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'startHighlighting' || request.message === 'stopHighlighting') {
    console.log(`Received message from popup.js: ${request.message}`);
    // Send the message to the content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {message: request.message});
    });
    sendResponse('Message received'); // Send a response back to the popup
    return true; // Indicate that the response will be sent asynchronously
  }
});
