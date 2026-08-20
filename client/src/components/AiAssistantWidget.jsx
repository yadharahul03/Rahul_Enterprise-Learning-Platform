import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import "./Dashboard.css";

export default function AiAssistantWidget() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("EXPLAIN_CONCEPT");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hi! I am your Enterprise Learning AI Assistant. How can I help you today?",
      suggestions: ["Explain a concept", "Summarize lesson", "Interview prep", "Generate quiz"],
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText, queryMode) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim() && !queryMode) return;

    const currentMode = queryMode || mode;
    const userMsg = { sender: "user", text: textToSend || `Requesting ${currentMode}` };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const aiData = await api.post("/ai/chat", {
        prompt: textToSend,
        type: currentMode,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiData.response,
          suggestions: aiData.suggestions || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Could not connect to AI Assistant. Is the server online?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button className="ss-ai-fab" onClick={() => setIsOpen(true)} title="Enterprise Learning AI Learning Assistant">
        ✨ AI Assistant
      </button>
    );
  }

  return (
    <div className="ss-ai-window">
      <div className="ss-ai-header">
        <div>
          <h3 className="ss-ai-title">✨ AI Learning Assistant</h3>
          <p className="ss-ai-sub">Concepts, doubts, summaries & interview prep</p>
        </div>
        <button className="ss-ai-close" onClick={() => setIsOpen(false)}>&times;</button>
      </div>

      <div className="ss-ai-modes">
        {[
          { key: "EXPLAIN_CONCEPT", label: "💡 Concept" },
          { key: "SUMMARY", label: "📝 Summary" },
          { key: "EXPLAIN_CODE", label: "🔍 Code" },
          { key: "INTERVIEW_PREP", label: "🎯 Interview" },
          { key: "GENERATE_QUIZ", label: "🧪 Quiz" },
        ].map((m) => (
          <button
            key={m.key}
            className={`ss-ai-mode-btn ${mode === m.key ? "active" : ""}`}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="ss-ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ss-ai-msg ${m.sender}`}>
            <p style={{ whiteSpace: "pre-line", margin: 0 }}>{m.text}</p>
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="ss-ai-suggestions">
                {m.suggestions.map((s, si) => (
                  <button key={si} className="ss-ai-chip" onClick={() => handleSend(s, mode)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <p style={{ fontSize: 12, color: "var(--st-text-muted)" }}>Thinking...</p>}
      </div>

      <form
        className="ss-ai-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          className="ss-ai-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Ask about ${mode.toLowerCase().replace('_', ' ')}...`}
        />
        <button type="submit" className="ss-resume-btn" disabled={loading}>
          Send
        </button>
      </form>

      <style>
        {`
          .ss-ai-fab { position: fixed; bottom: 24px; right: 24px; z-index: 999; background: linear-gradient(135deg, #7C6CF6, #22D3EE); color: #fff; border: none; padding: 12px 20px; border-radius: 999px; font-weight: 700; font-size: 13.5px; box-shadow: 0 8px 30px rgba(124,108,246,0.5); cursor: pointer; }
          .ss-ai-window { position: fixed; bottom: 24px; right: 24px; z-index: 1000; width: 380px; height: 520px; background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); backdrop-filter: blur(20px); display: flex; flex-direction: column; overflow: hidden; }
          .ss-ai-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 14px 18px; border-bottom: 1px solid var(--st-border); background: rgba(255,255,255,0.03); }
          .ss-ai-title { font-family: var(--font-display); font-size: 15px; margin: 0; }
          .ss-ai-sub { font-size: 11px; color: var(--st-text-muted); margin: 2px 0 0; }
          .ss-ai-close { background: transparent; border: none; color: var(--st-text-muted); font-size: 20px; cursor: pointer; }
          .ss-ai-modes { display: flex; gap: 6px; padding: 8px 14px; overflow-x: auto; border-bottom: 1px solid var(--st-border); background: rgba(0,0,0,0.2); }
          .ss-ai-mode-btn { background: transparent; border: 1px solid var(--st-border); color: var(--st-text-muted); border-radius: 999px; padding: 4px 10px; font-size: 11px; white-space: nowrap; cursor: pointer; }
          .ss-ai-mode-btn.active { background: rgba(124,108,246,0.2); color: var(--st-orange-light); border-color: rgba(124,108,246,0.4); font-weight: 600; }
          .ss-ai-messages { flex: 1; padding: 14px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; font-size: 12.5px; }
          .ss-ai-msg { padding: 10px 14px; border-radius: 14px; max-width: 85%; line-height: 1.5; }
          .ss-ai-msg.user { align-self: flex-end; background: var(--gradient-primary); color: #fff; }
          .ss-ai-msg.ai { align-self: flex-start; background: rgba(255,255,255,0.05); border: 1px solid var(--st-border); color: var(--st-cream); }
          .ss-ai-suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
          .ss-ai-chip { background: rgba(124,108,246,0.15); border: 1px solid rgba(124,108,246,0.3); color: var(--st-orange-light); border-radius: 999px; padding: 4px 10px; font-size: 10.5px; cursor: pointer; }
          .ss-ai-input-row { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--st-border); background: rgba(0,0,0,0.2); }
          .ss-ai-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--st-border); color: var(--st-cream); border-radius: 10px; padding: 8px 12px; font-size: 12.5px; }
        `}
      </style>
    </div>
  );
}
