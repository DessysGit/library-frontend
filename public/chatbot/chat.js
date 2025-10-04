// Chatbot functionality with proper API integration

function toggleChatbox() {
  const chatbox = document.getElementById('chatbox');
  chatbox.classList.toggle('hidden');
  
  // Auto-focus input when opening
  if (!chatbox.classList.contains('hidden')) {
    document.getElementById('user-input').focus();
  }
}

async function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  // Get username from session or default to "You"
  const senderName = window.currentUsername || "You";
  
  // Display user message
  appendMessage(senderName, message);
  input.value = '';
  
  // Show typing indicator
  const typingId = showTypingIndicator();

  try {
    // Use the same API_BASE_URL as defined in script.js
    const apiUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
    
    const response = await fetch(`${apiUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message })
    });

    // Remove typing indicator
    removeTypingIndicator(typingId);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    appendMessage('LibBot', data.reply || 'Sorry, I didn\'t understand that.');
    
  } catch (error) {
    console.error('Chatbot error:', error);
    removeTypingIndicator(typingId);
    
    let errorMessage = 'Sorry, I\'m having trouble connecting. Please try again.';
    
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    appendMessage('LibBot', errorMessage, true);
  }
}

function appendMessage(sender, text, isError = false) {
  const messages = document.getElementById('messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${sender === 'LibBot' ? 'bot-message' : 'user-message'} ${isError ? 'error-message' : ''}`;
  
  msgDiv.innerHTML = `
    <div class="message-header"><strong>${sender}</strong></div>
    <div class="message-text">${escapeHtml(text)}</div>
  `;
  
  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
}

function showTypingIndicator() {
  const messages = document.getElementById('messages');
  const typingDiv = document.createElement('div');
  const id = 'typing-' + Date.now();
  typingDiv.id = id;
  typingDiv.className = 'chat-message bot-message typing-indicator';
  typingDiv.innerHTML = `
    <div class="message-header"><strong>LibBot</strong></div>
    <div class="typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  messages.appendChild(typingDiv);
  messages.scrollTop = messages.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const indicator = document.getElementById(id);
  if (indicator) {
    indicator.remove();
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Enable sending message with Enter key
document.addEventListener('DOMContentLoaded', () => {
  const userInput = document.getElementById('user-input');
  if (userInput) {
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
  
  // Try to get username from the page
  initializeUsername();
});

// Initialize username from page elements
function initializeUsername() {
  const burgerUsername = document.getElementById('burger-username');
  if (burgerUsername && burgerUsername.textContent !== 'Username') {
    window.currentUsername = burgerUsername.textContent;
  }
}