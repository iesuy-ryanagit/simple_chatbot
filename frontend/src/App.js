import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div style={{ margin: "12px 0", position: "relative" }}>
      <pre
        style={{
          background: "#1e1e1e",
          color: "#fff",
          borderRadius: 10,
          padding: 14,
          overflowX: "auto",
          fontSize: 14,
          margin: 0,
        }}
      >
        <code>{code}</code>
      </pre>

      <button
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          fontSize: 12,
          border: "none",
          borderRadius: 6,
          padding: "4px 8px",
          background: copied ? "#10a37f" : "#444",
          color: "#fff",
        }}
      >
        {copied ? "コピー済み" : "コピー"}
      </button>
    </div>
  );
}

function getSessionId() {
  let id = localStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("session_id", id);
  }
  return id;
}

const API_URL = process.env.REACT_APP_API_URL;

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const textareaRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input;
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setMessages((p) => [...p, { sender: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: getSessionId(),
          message: text,
        }),
      });

      const data = await res.json();

      setMessages((p) => [
        ...p,
        { sender: "bot", text: data.reply },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        { sender: "bot", text: "エラーが発生しました" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background:  "#ffffff",
        color: "#111",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      {/* CHAT AREA */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 0",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ padding: "18px 16px" }}>
            <div
              style={{
                maxWidth: 800,
                margin: "0 auto",
                display: "flex",
                justifyContent:
                  m.sender === "user"
                    ? "flex-end"
                    : "center",
              }}
            >
              {/* USER (minimal box) */}
              {m.sender === "user" ? (
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "8px 12px",
                    background: "#f2f2f2",
                    fontSize: 15,
                    wordBreak: "break-word",
                    borderRadius: 12,
                  }}
                >
                  {m.text}
                </div>
              ) : (
                /* BOT (center plain text style) */
                <div
                  style={{
                    maxWidth: 700,
                    width: "100%",
                    textAlign: "left",
                    fontSize: 16,
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <ReactMarkdown
                    components={{
                      code({ inline, children }) {
                        if (inline) {
                          return (
                            <code
                              style={{
                                background: "#222",
                                padding: "2px 6px",
                                borderRadius: 6,
                                fontSize: 14,
                              }}
                            >
                              {children}
                            </code>
                          );
                        }
                        return (
                          <CodeBlock>{children}</CodeBlock>
                        );
                      },
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div
            style={{
              textAlign: "center",
              color: "#aaa",
              padding: 20,
            }}
          >
            ...
          </div>
        )}

        <div ref={endRef} />
      </div>



      {messages.length === 0 && (
  <div
    style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      color: "#666",
      textAlign: "center",
      padding: 24,
    }}
  >
    <h1
      style={{
        fontSize: 32,
        marginBottom: 12,
        color: "#111",
      }}
    >
      Simple Chatbot
    </h1>

    <p
      style={{
        fontSize: 16,
        maxWidth: 500,
        lineHeight: 1.6,
      }}
    >
      質問してみましょう
      <br />
      コード生成・文章作成・相談などできます
    </p>

    <div
      style={{
        marginTop: 32,
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {[
        "ReactでTODOアプリを作って",
        "Pythonでスクレイピングしたい",
        "かっこいいロゴ案を出して",
      ].map((example) => (
        <button
          key={example}
          onClick={() => setInput(example)}
          style={{
            border: "1px solid #e5e5e5",
            background: "#fff",
            padding: "10px 14px",
            borderRadius: 12,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {example}
        </button>
      ))}
    </div>
  </div>
)}

      {/* INPUT (no border line, no separator) */}
      <div style={{ padding: 16 }}>
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            position: "relative",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            placeholder="質問してみましょう"
            onChange={(e) => {
              setInput(e.target.value);

              e.target.style.height = "auto";

              const maxHeight = 180;

              if (e.target.scrollHeight > maxHeight) {
                e.target.style.height = maxHeight + "px";
                e.target.style.overflowY = "auto";
              } else {
                e.target.style.height = e.target.scrollHeight + "px";
                e.target.style.overflowY = "hidden";
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            style={{
              width: "100%",
              background:  "#ffffff",
              color: "#111",
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: "12px 48px 12px 12px",
              resize: "none",
              outline: "none",
              fontSize: 15,
              minHeight: 48,
              maxHeight: 180,
              overflowY: "hidden",
            }}
          />

        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            position: "absolute",
            right: 10,
            bottom: 10,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ↑
        </button>
        </div>
      </div>
    </div>
  );
}