/**
 * Content Script - Inject Sidebar into Google Meet
 * 
 * This script runs on meet.google.com and injects the Nybble Vibe sidebar
 */

console.log('🎮 Nybble Vibe: Content script loaded');

// Wait for page to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSidebar);
} else {
  initializeSidebar();
}

function initializeSidebar() {
  console.log('🎮 Nybble Vibe: Initializing sidebar');
  
  // Check if sidebar already exists
  if (document.getElementById('nybble-vibe-sidebar')) {
    console.log('🎮 Nybble Vibe: Sidebar already exists');
    return;
  }
  
  // Create sidebar container
  const sidebar = document.createElement('div');
  sidebar.id = 'nybble-vibe-sidebar';
  sidebar.className = 'nybble-vibe-container';
  
  // Create iframe to host the sidebar app
  const iframe = document.createElement('iframe');
  iframe.id = 'nybble-vibe-iframe';
  iframe.src = chrome.runtime.getURL('sidebar/index.html');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  
  sidebar.appendChild(iframe);
  document.body.appendChild(sidebar);
  
  console.log('✅ Nybble Vibe: Sidebar injected successfully');
  
  // Listen for messages from sidebar
  window.addEventListener('message', handleSidebarMessage);
}

function handleSidebarMessage(event) {
  // Only accept messages from our extension
  if (event.source !== window) return;
  
  const { type, data } = event.data;
  
  if (!type || !type.startsWith('NYBBLE_VIBE_')) return;
  
  console.log('📩 Nybble Vibe: Message from sidebar:', type, data);
  
  // Handle different message types
  switch (type) {
    case 'NYBBLE_VIBE_MINIMIZE':
      toggleSidebar(false);
      break;
      
    case 'NYBBLE_VIBE_MAXIMIZE':
      toggleSidebar(true);
      break;
      
    default:
      console.log('🤷 Nybble Vibe: Unknown message type:', type);
  }
}

function toggleSidebar(show) {
  const sidebar = document.getElementById('nybble-vibe-sidebar');
  if (sidebar) {
    sidebar.style.display = show ? 'block' : 'none';
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  console.log('👋 Nybble Vibe: Cleaning up');
});

