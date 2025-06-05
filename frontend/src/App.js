import React, { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);

    // バックエンドAPIに送信
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();

    const botMessage = { sender: "bot", text: data.reply };
    setMessages(prev => [...prev, botMessage]);

    setInput("");
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <h2>Simple Chatbot</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          minHeight: 300,
          marginBottom: 10,
          overflowY: "auto",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <b>{msg.sender === "user" ? "You" : "Bot"}: </b>
            {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "80%", padding: 8 }}
      />
      <button onClick={sendMessage} style={{ padding: "8px 16px" }}>
        Send
      </button>
    </div>
  );
}

export default App;
