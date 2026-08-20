import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import api from "../api/client";

export default function Forum() {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [activeThreadDetails, setActiveThreadDetails] = useState(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("TECH");
  const [newContent, setNewContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const queryStr = tagFilter !== "ALL" ? `?tag=${tagFilter}` : "";
      const list = await api.get(`/forum/threads${queryStr}`);
      setThreads(list || []);
      if (list && list.length > 0 && !activeThread) {
        loadThreadDetails(list[0].id);
        setActiveThread(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadThreadDetails = async (threadId) => {
    try {
      const details = await api.get(`/forum/threads/${threadId}`);
      setActiveThreadDetails(details);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [tagFilter]);

  const handleSelectThread = (thread) => {
    setActiveThread(thread);
    loadThreadDetails(thread.id);
  };

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/forum/threads/${id}/upvote`, {});
      setThreads((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                upvotesCount: res.upvoted ? t.upvotesCount + 1 : Math.max(0, t.upvotesCount - 1),
                hasUpvoted: res.upvoted,
              }
            : t
        )
      );
      if (activeThreadDetails && activeThreadDetails.id === id) {
        setActiveThreadDetails((prev) => ({
          ...prev,
          upvotesCount: res.upvoted ? prev.upvotesCount + 1 : Math.max(0, prev.upvotesCount - 1),
          hasUpvoted: res.upvoted,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    try {
      await api.post("/forum/threads", {
        title: newTitle,
        content: newContent,
        tag: newTag,
      });
      setShowModal(false);
      setNewTitle("");
      setNewContent("");
      await loadThreads();
    } catch (err) {
      alert(err.message || "Failed to create thread");
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !activeThread) return;
    try {
      await api.post(`/forum/threads/${activeThread.id}/replies`, {
        content: replyContent,
      });
      setReplyContent("");
      await loadThreadDetails(activeThread.id);
      loadThreads();
    } catch (err) {
      alert(err.message || "Failed to add reply");
    }
  };

  const filtered = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="ss-dashboard" style={{ maxWidth: 1150 }}>
        <div className="ss-header" style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="ss-welcome">💬 Discussion Forums</h1>
            <p className="ss-streak">Engage with fellow student developers and request guidance from syllabus leads.</p>
          </div>
          <button className="ss-resume-btn" onClick={() => setShowModal(true)}>
            + Start a Thread
          </button>
        </div>

        <div className="ss-forum-grid">
          {/* Threads List */}
          <div className="ss-card" style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <input
                className="ss-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search forum topics..."
                style={{ flex: 1, fontSize: "0.85rem", padding: "8px 12px" }}
              />
              <select className="ss-select" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
                <option value="ALL">All Tags</option>
                <option value="TECH">TECH</option>
                <option value="DESIGN">DESIGN</option>
                <option value="GENERAL">GENERAL</option>
              </select>
            </div>

            {loading ? (
              <p style={{ color: "var(--st-text-muted)", padding: 16 }}>Loading threads...</p>
            ) : filtered.length === 0 ? (
              <p style={{ color: "var(--st-text-muted)", padding: 16 }}>No forum threads found.</p>
            ) : (
              filtered.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelectThread(t)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    border: `1px solid ${activeThread?.id === t.id ? "var(--st-emerald)" : "var(--st-border)"}`,
                    background: activeThread?.id === t.id ? "rgba(16, 185, 129, 0.04)" : "var(--st-surface)",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--st-text-muted)", marginBottom: 4 }}>
                    <span className="ss-badge-tech">{t.tag}</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 style={{ margin: "4px 0 6px 0", fontSize: "0.92rem", lineHeight: 1.4 }}>{t.title}</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "var(--st-text-muted)" }}>
                    <span>By: {t.authorName} ({t.authorRole})</span>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <button onClick={(e) => handleUpvote(t.id, e)} style={{ background: "none", border: "none", color: t.hasUpvoted ? "#10B981" : "inherit", cursor: "pointer", fontWeight: 600 }}>
                        👍 {t.upvotesCount}
                      </button>
                      <span>💬 {t.repliesCount} replies</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Thread Detail View */}
          <div className="ss-card">
            {activeThreadDetails ? (
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <span className="ss-badge-tech">{activeThreadDetails.tag}</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--st-text-muted)" }}>Posted by {activeThreadDetails.authorName} ({activeThreadDetails.authorRole}) • {new Date(activeThreadDetails.createdAt).toLocaleDateString()}</span>
                </div>
                <h2 style={{ margin: "0 0 16px 0", fontSize: "1.3rem" }}>{activeThreadDetails.title}</h2>
                <div style={{ fontSize: "0.92rem", lineHeight: 1.6, background: "var(--st-surface)", padding: 16, borderRadius: 8, border: "1px solid var(--st-border)", marginBottom: 20 }}>
                  {activeThreadDetails.content}
                </div>

                <h4 style={{ fontSize: "0.95rem", margin: "0 0 12px 0" }}>💬 Conversation Replies ({activeThreadDetails.replies?.length || 0})</h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {activeThreadDetails.replies && activeThreadDetails.replies.length > 0 ? (
                    activeThreadDetails.replies.map((r) => (
                      <div key={r.id} style={{ padding: 12, borderRadius: 8, border: "1px solid var(--st-border)", background: "var(--st-surface)", fontSize: "0.85rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--st-text-muted)", fontSize: "0.75rem", marginBottom: 4 }}>
                          <strong>{r.authorName} ({r.authorRole})</strong>
                          <span>{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p style={{ margin: 0 }}>{r.content}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "var(--st-text-muted)", fontSize: "0.85rem" }}>No replies yet. Be the first to reply!</p>
                  )}
                </div>

                <form onSubmit={handleAddReply} style={{ display: "flex", gap: 8 }}>
                  <input
                    className="ss-input"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    style={{ flex: 1, fontSize: "0.85rem" }}
                    required
                  />
                  <button type="submit" className="ss-resume-btn">Reply</button>
                </form>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--st-text-muted)", padding: "3rem" }}>
                Select a thread from the list to view conversations.
              </div>
            )}
          </div>
        </div>

        {/* Start Thread Modal */}
        {showModal && (
          <div className="ss-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="ss-modal-card" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>+ Start a Discussion Thread</h3>
              <form onSubmit={handleCreateThread} style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--st-text-muted)" }}>Category / Tag</label>
                <select className="ss-select" value={newTag} onChange={(e) => setNewTag(e.target.value)}>
                  <option value="TECH">TECH</option>
                  <option value="DESIGN">DESIGN</option>
                  <option value="GENERAL">GENERAL</option>
                </select>

                <label style={{ fontSize: "0.8rem", color: "var(--st-text-muted)" }}>Thread Topic Title</label>
                <input className="ss-input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required placeholder="E.g. How to handle OAuth2 redirects in React?" />

                <label style={{ fontSize: "0.8rem", color: "var(--st-text-muted)" }}>Detailed Explanation</label>
                <textarea className="ss-input" value={newContent} onChange={(e) => setNewContent(e.target.value)} required rows={4} placeholder="Describe your question or insight in detail..." />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <button type="button" className="ss-chip" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="ss-resume-btn">Post Thread →</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ss-forum-grid { display: grid; grid-template-columns: 400px 1fr; gap: 1.25rem; }
        @media (max-width: 800px) { .ss-forum-grid { grid-template-columns: 1fr; } }
      `}</style>
    </AppLayout>
  );
}
