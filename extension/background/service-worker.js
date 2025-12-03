/**
 * Background Service Worker
 * 
 * Minimal service worker for extension lifecycle management
 */

console.log('🎮 Nybble Vibe: Service worker initialized');

// Extension installed
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🎮 Nybble Vibe: Extension installed', details.reason);
  
  if (details.reason === 'install') {
    // First time install
    console.log('👋 Welcome to Nybble Vibe!');
    
    // Set default storage values
    chrome.storage.local.set({
      eventId: null,
      participantId: null,
      settings: {
        notifications: true,
        sounds: true
      }
    });
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📩 Message received:', message);
  
  const { type, data } = message;
  
  switch (type) {
    case 'GET_EVENT_ID':
      chrome.storage.local.get(['eventId'], (result) => {
        sendResponse({ eventId: result.eventId });
      });
      return true; // Keep channel open for async response
      
    case 'SET_EVENT_ID':
      chrome.storage.local.set({ eventId: data.eventId }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'GET_PARTICIPANT_ID':
      chrome.storage.local.get(['participantId'], (result) => {
        sendResponse({ participantId: result.participantId });
      });
      return true;
      
    case 'SET_PARTICIPANT_ID':
      chrome.storage.local.set({ participantId: data.participantId }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    default:
      console.log('Unknown message type:', type);
      sendResponse({ error: 'Unknown message type' });
  }
});

// Keep service worker alive (for development)
setInterval(() => {
  console.log('💓 Service worker heartbeat');
}, 20000); // Every 20 seconds

