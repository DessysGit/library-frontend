function toggleChatbox() {
    const chatbox = document.getElementById('chatbox');
    chatbox.classList.toggle('hidden');
  }
  
  async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;
  
    appendMessage('You', message);
    input.value = '';
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
  
      const data = await response.json();
      appendMessage('AI', data.reply);
    } catch (error) {
      appendMessage('AI', 'Error: could not reach AI server.');
      console.error(error);
    }
  }
  
  function appendMessage(sender, text) {
    const messages = document.getElementById('messages');
    const msgDiv = document.createElement('div');
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
  }
  