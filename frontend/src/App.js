import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    console.log(API_URL);

    try {
      // バックエンドAPIに送信
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      const botMessage = { sender: "bot", text: data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: "bot", text: "エラーが発生しました" }]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: 'Segoe UI, sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Simple Chat</h2>
      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          background: '#f7f7f8',
          padding: 16,
          minHeight: 400,
          marginBottom: 16,
          overflowY: "auto",
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '10px 16px',
                borderRadius: 18,
                background: msg.sender === "user" ? "#0078fe" : "#e5e5ea",
                color: msg.sender === "user" ? "#fff" : "#222",
                boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                wordBreak: 'break-word',
                fontSize: 16,
              }}
            >
              {msg.sender === "bot"
                ? <ReactMarkdown>{msg.text}</ReactMarkdown>
                : msg.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 18,
            border: '1px solid #e5e5e5',
            fontSize: 16,
            outline: 'none',
            background: '#fff',
          }}
          placeholder="メッセージを入力..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '0 24px',
            borderRadius: 18,
            border: 'none',
            background: loading ? '#b3d3fa' : '#0078fe',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
          }}
          disabled={loading}
        >
          {loading ? '送信中...' : '送信'}
        </button>
      </div>
    </div>
  );
}

export default App;
