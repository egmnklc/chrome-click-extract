console.log('Start Highlighting button clicked');
document.getElementById('start').addEventListener('click', () => {
  chrome.runtime.sendMessage({ message: 'startHighlighting' });
  window.close();
});

console.log('Stop Highlighting button clicked');
document.getElementById('stop').addEventListener('click', () => {
  chrome.runtime.sendMessage({ message: 'stopHighlighting' });
  window.close();
});
