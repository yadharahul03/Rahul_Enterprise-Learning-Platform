import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import AppLayout from "./AppLayout";
import "./Dashboard.css";

const QUICK_PROMPTS = [
  {
    icon: "💡",
    label: "Explain Concept",
    mode: "EXPLAIN_CONCEPT",
    prompt: "Explain how Spring Boot REST controllers map HTTP requests using annotations.",
  },
  {
    icon: "🔍",
    label: "Analyze Code",
    mode: "EXPLAIN_CODE",
    prompt: "Analyze the time and space complexity of Virtual Threads in Java 21.",
  },
  {
    icon: "🎯",
    label: "Interview Prep",
    mode: "INTERVIEW_PREP",
    prompt: "Give me top 3 interview questions on React Virtual DOM and diffing algorithms.",
  },
  {
    icon: "🧪",
    label: "Generate Quiz",
    mode: "GENERATE_QUIZ",
    prompt: "Generate a 5-question knowledge assessment quiz on MySQL relational indexes.",
  },
  {
    icon: "📝",
    label: "Lesson Summary",
    mode: "SUMMARY",
    prompt: "Summarize key architectural takeaways from building clean REST APIs.",
  },
  {
    icon: "❓",
    label: "Solve Doubt",
    mode: "DOUBT",
    prompt: "What is the difference between @PreAuthorize and JwtAuthenticationFilter in Spring Security?",
  },
];

export default function AiChatbot() {
  const { token, user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [activeMode, setActiveMode] = useState("EXPLAIN_CONCEPT");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `👋 Hello ${user?.name ? user.name.split(" ")[0] : "Student"}! I am your Enterprise Learning AI Assistant.\nAsk me any programming doubt, code explanation, interview prep question, or course recommendation!`,
      suggestions: [
        "Explain Spring Security JWT authentication",
        "Give me 3 React interview questions",
        "Explain Java 21 Virtual Threads",
        "Recommend next skill route",
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText, queryMode) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim() && !queryMode) return;

    const currentMode = queryMode || activeMode;
    const userMessage = { sender: "user", text: textToSend };

    setMessages((prev) => [...prev, userMessage]);
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
          recommendedCourses: aiData.recommendedCourses || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "❌ Could not reach AI Assistant. Please verify backend is running." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="ss-dashboard" style={{ maxWidth: 1100 }}>
        <div className="ss-header" style={{ marginBottom: "1.25rem" }}>
          <div>
            <h1 className="ss-welcome">✨ AI Learning Chatbot</h1>
            <p className="ss-streak">Instant explanations, code walkthroughs, quiz generation & interview prep</p>
          </div>
        </div>

        {/* Quick Prompt Shortcuts Grid */}
        <div className="ss-ai-shortcut-grid">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q.label}
              className={`ss-ai-shortcut-card ${activeMode === q.mode ? "active" : ""}`}
              onClick={() => {
                setActiveMode(q.mode);
                handleSend(q.prompt, q.mode);
              }}
            >
              <span className="icon">{q.icon}</span>
              <div>
                <strong>{q.label}</strong>
                <p>{q.prompt.substring(0, 45)}...</p>
              </div>
            </button>
          ))}
        </div>

        {/* Mode Selector Tabs */}
        <div className="ss-schedule-tabs" style={{ marginTop: 18, marginBottom: 14 }}>
          {[
            { key: "EXPLAIN_CONCEPT", label: "💡 Concept Explainer" },
            { key: "EXPLAIN_CODE", label: "🔍 Code Analyzer" },
            { key: "INTERVIEW_PREP", label: "🎯 Interview Prep" },
            { key: "GENERATE_QUIZ", label: "🧪 Quiz Generator" },
            { key: "SUMMARY", label: "📝 Summarizer" },
            { key: "RECOMMENDATION", label: "🌟 Recommendations" },
          ].map((m) => (
            <button
              key={m.key}
              className={`ss-learn-tab ${activeMode === m.key ? "is-active" : ""}`}
              onClick={() => setActiveMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Main Chat Container */}
        <div className="ss-chatbot-container">
          <div className="ss-chatbot-messages">
            {messages.map((m, index) => (
              <div key={index} className={`ss-chatbot-row ${m.sender}`}>
                <div className="ss-chatbot-avatar">
                  {m.sender === "user" ? "👤" : "🤖"}
                </div>
                <div className="ss-chatbot-bubble">
                  <div style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>{m.text}</div>

                  {m.recommendedCourses && m.recommendedCourses.length > 0 && (
                    <div className="ss-ai-courses-box">
                      <p className="title">Recommended Skill Routes:</p>
                      <ul>
                        {m.recommendedCourses.map((c, ci) => (
                          <li key={ci}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="ss-chatbot-chips">
                      {m.suggestions.map((s, si) => (
                        <button
                          key={si}
                          className="ss-chatbot-chip"
                          onClick={() => handleSend(s, activeMode)}
                        >
                          {s} &rarr;
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="ss-chatbot-row ai">
                <div className="ss-chatbot-avatar">🤖</div>
                <div className="ss-chatbot-bubble thinking">
                  <span>Enterprise Learning AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            className="ss-chatbot-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              className="ss-chatbot-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Ask Enterprise Learning AI anything about ${activeMode.toLowerCase().replace('_', ' ')}...`}
            />
            <button type="submit" className="ss-resume-btn" disabled={loading || !prompt.trim()}>
              {loading ? "Sending..." : "Ask AI →"}
            </button>
          </form>
        </div>
      </div>

      <style>
        {`
          .ss-ai-shortcut-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
          .ss-ai-shortcut-card { display: flex; gap: 12px; align-items: flex-start; background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 14px; padding: 12px 14px; text-align: left; color: var(--st-cream); cursor: pointer; transition: all 0.2s ease; }
          .ss-ai-shortcut-card:hover { border-color: rgba(124,108,246,0.4); transform: translateY(-2px); }
          .ss-ai-shortcut-card.active { border-color: var(--st-sage); background: rgba(34,211,238,0.08); }
          .ss-ai-shortcut-card .icon { font-size: 20px; flex-shrink: 0; }
          .ss-ai-shortcut-card strong { display: block; font-size: 13px; margin-bottom: 2px; }
          .ss-ai-shortcut-card p { font-size: 11px; color: var(--st-text-muted); margin: 0; line-height: 1.3; }

          .ss-chatbot-container { background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; height: 580px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); backdrop-filter: blur(20px); }
          .ss-chatbot-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 18px; }
          .ss-chatbot-row { display: flex; gap: 12px; max-width: 85%; }
          .ss-chatbot-row.user { align-self: flex-end; flex-direction: row-reverse; }
          .ss-chatbot-row.ai { align-self: flex-start; }
          .ss-chatbot-avatar { width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 1px solid var(--st-border); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
          .ss-chatbot-bubble { background: rgba(255,255,255,0.05); border: 1px solid var(--st-border); border-radius: 16px; padding: 14px 18px; font-size: 13.5px; color: var(--st-cream); }
          .ss-chatbot-row.user .ss-chatbot-bubble { background: var(--gradient-primary); border: none; color: #fff; }
          .ss-chatbot-bubble.thinking { color: var(--st-text-muted); font-style: italic; }

          .ss-ai-courses-box { margin-top: 12px; padding: 10px 14px; background: rgba(124,108,246,0.12); border: 1px solid rgba(124,108,246,0.3); border-radius: 10px; }
          .ss-ai-courses-box .title { font-weight: 700; font-size: 12px; color: var(--st-orange-light); margin-bottom: 4px; }
          .ss-ai-courses-box ul { margin: 0; padding-left: 18px; font-size: 12.5px; color: var(--st-cream); }

          .ss-chatbot-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
          .ss-chatbot-chip { background: rgba(124,108,246,0.14); border: 1px solid rgba(124,108,246,0.3); color: var(--st-orange-light); border-radius: 999px; padding: 5px 12px; font-size: 11.5px; cursor: pointer; transition: all 0.2s ease; }
          .ss-chatbot-chip:hover { background: rgba(124,108,246,0.3); color: #fff; }

          .ss-chatbot-input-bar { display: flex; gap: 10px; padding: 16px; border-top: 1px solid var(--st-border); background: rgba(0,0,0,0.2); }
          .ss-chatbot-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--st-border); color: var(--st-cream); border-radius: 12px; padding: 12px 16px; font-size: 13.5px; font-family: var(--font-body); }
          .ss-chatbot-input::placeholder { color: var(--st-text-muted); }
        `}
      </style>
    </AppLayout>
  );
}
