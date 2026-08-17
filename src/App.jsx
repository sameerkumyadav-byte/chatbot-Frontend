import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [sessionId, setSessionId] = useState(() => {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('sessionId', id);
  }
  return id;
});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
  const loadHistory = async () => {
    const res = await fetch(`https://chatbot-backend-teta.onrender.com/history/${sessionId}`);
    const data = await res.json();
    setMessages(data.messages);
  };
  loadHistory();
}, [sessionId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
 
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://chatbot-backend-teta.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, sessionId })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Something went wrong. Is the backend running?' }]);
    } finally {
      setLoading(false);
    }
  };
     const startNewChat = () => {
  const newId = crypto.randomUUID();
  localStorage.setItem('sessionId', newId);
  setSessionId(newId);
  setMessages([]);
};


  return (
    <div className="chat-container">
      <div className="chat-header">
  <span>Rosy</span>
  <button className="new-chat-btn" onClick={startNewChat}>+ New Chat</button>
</div>
      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-state">Send a message to start chatting</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`bubble ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="bubble assistant typing">
            <span></span><span></span><span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} disabled={loading}>Send</button>
      </div>
    </div>
  );
}

export default App;
