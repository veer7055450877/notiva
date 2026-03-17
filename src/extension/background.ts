// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Notiva Extension successfully installed.');

  // Create a context menu item for quick capture
  chrome.contextMenus.create({
    id: 'capture-to-notiva',
    title: 'Save selection to Notiva',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'capture-to-notiva' && info.selectionText) {
    // Open the popup or save directly via API
    // For Manifest V3, we can't programmatically open the popup easily without user interaction,
    // so we can save it directly to the MockAPI backend.
    const noteData = {
      title: tab?.title || 'Quick Capture',
      content: `> ${info.selectionText}\n\nSource: ${tab?.url}`,
      color: 'default',
      tags: ['extension-capture'],
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    fetch('https://69b6f01bffbcd02860943a7e.mockapi.io/api/v1/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    })
    .then(() => console.log('Successfully saved to Notiva from context menu'))
    .catch(err => console.error('Failed to save to Notiva', err));
  }
});
