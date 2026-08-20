import { useState } from "react";
import AppLayout from "./AppLayout";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./AiRoadmap.css";

export default function AiRoadmap() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [aiReport, setAiReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Predefined role options for fast selection
  const roleOptions = [
    { label: "Full-Stack Developer", icon: "🚀", id: "Full-Stack Developer" },
    {
      label: "Frontend React Engineer",
      icon: "⚛️",
      id: "Frontend React Engineer",
    },
    { label: "Backend Java Engineer", icon: "☕", id: "Backend Java Engineer" },
    {
      label: "DevOps & Cloud Engineer",
      icon: "☁️",
      id: "DevOps & Cloud Engineer",
    },
  ];

  // Structural header labels to filter out from skill pills
  const IGNORED_SKILL_LABELS = new Set([
    "goal",
    "goals",
    "skills",
    "skill",
    "milestones",
    "milestone",
    "target skills",
    "target",
    "overview",
    "key focus",
    "focus",
    "duration",
    "phase",
    "step",
    "recommendation",
    "recommended",
    "course",
    "courses",
    "status",
    "progress",
    "category",
    "next steps",
    "description",
    "action items",
    "key takeaways",
    "outcome",
    "outcomes",
  ]);

  const cleanSkillName = (s) => {
    if (!s) return null;
    const raw = s.replace(/[:\*\-\•]/g, "").trim();
    if (raw.length < 2 || raw.length > 28) return null;
    if (IGNORED_SKILL_LABELS.has(raw.toLowerCase())) return null;
    return raw;
  };

  // Preserve existing API endpoint & payload logic
  const generateRoadmap = async (targetRole, openModalAfter = false) => {
    const roleToUse = targetRole || selectedRole || customRole;
    if (!roleToUse) return;

    setLoading(true);
    try {
      const res = await api.post("/ai/chat", {
        prompt: `Generate a personalized step-by-step career learning roadmap for becoming a top-tier ${roleToUse}. Highlight my completed course milestones and next steps.`,
        type: "ROADMAP",
      });
      setAiReport(res.response || "No roadmap generated.");
      setHasGenerated(true);
      if (openModalAfter) {
        setIsModalOpen(true);
      }
    } catch (err) {
      setAiReport(
        "Could not connect to AI Assistant. Please verify backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Defensive parser for AI text response into structured topic cards
  const parseRoadmap = (text) => {
    if (!text || typeof text !== "string") return [];

    const lines = text.split("\n");
    const phases = [];
    let currentPhase = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Skip markdown table separator lines like | :--- | :--- |
      if (/^\|?\s*:?-+:?\s*\|/.test(trimmed)) return;

      const isPhaseHeader =
        /^#{1,4}\s+(Phase\s+\d+|Stage\s+\d+|Module\s+\d+)/i.test(trimmed) ||
        /^(Phase|Stage|Module)\s+\d+/i.test(trimmed);

      if (isPhaseHeader) {
        if (currentPhase) {
          phases.push(currentPhase);
        }
        const cleanTitle = trimmed
          .replace(/^#{1,4}\s*/, "")
          .replace(/\*\*/g, "");
        const durationMatch = cleanTitle.match(/\((.*?)\)|\[(.*?)\]/);

        currentPhase = {
          title: cleanTitle,
          duration: durationMatch ? durationMatch[1] || durationMatch[2] : null,
          goal: "",
          steps: [],
          skills: [],
        };
      } else if (currentPhase) {
        // Handle explicit Goal line (e.g. "Goal: Master the operating system...")
        const goalMatch = trimmed.match(
          /^(?:goal|objective|focus)\s*:\s*(.*)/i,
        );
        if (goalMatch && goalMatch[1]) {
          currentPhase.goal = goalMatch[1].replace(/\*\*/g, "").trim();
          return;
        }

        // Handle explicit Skills: line (e.g. "**Skills:** React, Node.js, SQL")
        const skillsHeaderMatch = trimmed.match(
          /(?:skills|technologies|tech stack|tools|target skills)\s*:\s*(.*)/i,
        );
        if (skillsHeaderMatch && skillsHeaderMatch[1]) {
          const rawSkillsList = skillsHeaderMatch[1].split(/[,;|\•]/);
          rawSkillsList.forEach((item) => {
            const valid = cleanSkillName(item);
            if (valid && !currentPhase.skills.includes(valid)) {
              currentPhase.skills.push(valid);
            }
          });
          return;
        }

        const cleanStep = trimmed
          .replace(/^[•\-\*⚡]\s+|^\d+[\.\)]\s+/, "")
          .trim();

        // Extract bold tech keywords for skill pills
        const boldMatches = Array.from(trimmed.matchAll(/\*\*(.*?)\*\*/g)).map(
          (m) => m[1],
        );
        if (boldMatches.length > 0) {
          boldMatches.forEach((raw) => {
            const valid = cleanSkillName(raw);
            if (valid && !currentPhase.skills.includes(valid)) {
              currentPhase.skills.push(valid);
            }
          });
        }

        // Parse key-value topic format (e.g. "Linux Administration: File systems, SSH...")
        const colonIdx = cleanStep.indexOf(":");
        if (colonIdx > 0 && colonIdx < 45) {
          const rawTitle = cleanStep
            .substring(0, colonIdx)
            .replace(/\*\*/g, "")
            .trim();
          const rawDesc = cleanStep
            .substring(colonIdx + 1)
            .replace(/\*\*/g, "")
            .trim();
          const isGeneric = /^(goal|skills|milestones|target skills)\s*$/i.test(
            rawTitle,
          );
          if (!isGeneric && rawDesc.length > 0) {
            currentPhase.steps.push({ title: rawTitle, desc: rawDesc });
            return;
          }
        }

        if (cleanStep.length > 3) {
          currentPhase.steps.push({
            title: "",
            desc: cleanStep.replace(/\*\*/g, ""),
          });
        }
      }
    });

    if (currentPhase) {
      phases.push(currentPhase);
    }

    // Guarantee that every phase has a goal statement
    phases.forEach((phase) => {
      if (!phase.goal) {
        phase.goal = `Master key concepts of ${phase.title} to build foundational and practical competence.`;
      }
    });

    return phases;
  };

  const parsedPhases = parseRoadmap(aiReport);
  const activeRoleName = selectedRole === "Custom" ? customRole : selectedRole;

  const handlePrint = () => {
    window.print();
  };

  // Helper render function for structured roadmap timeline
  const renderRoadmapTimeline = () => {
    if (parsedPhases.length > 0) {
      return (
        <div className="ss-rm-timeline">
          {parsedPhases.map((phase, idx) => (
            <div key={idx} className="ss-rm-phase-item">
              <div className="ss-rm-node-dot">{idx + 1}</div>
              <div className="ss-rm-phase-card">
                {/* 1. Phase Header */}
                <div className="ss-rm-phase-head">
                  <div className="ss-rm-phase-title-wrap">
                    <span className="ss-rm-phase-num-badge">
                      Phase 0{idx + 1}
                    </span>
                    <h3 className="ss-rm-phase-title">{phase.title}</h3>
                  </div>
                  {phase.duration && (
                    <span className="ss-rm-phase-duration">
                      ⏱️ {phase.duration}
                    </span>
                  )}
                </div>

                {/* 2. Goal Banner */}
                {phase.goal && (
                  <div className="ss-rm-phase-goal">
                    <strong>Goal:</strong> {phase.goal}
                  </div>
                )}

                {/* 3. Point-wise Topic Breakdown (Bold Topic Title: Topic Description) */}
                {phase.steps.length > 0 && (
                  <div className="ss-rm-topics-list">
                    {phase.steps.map((item, sIdx) => (
                      <div key={sIdx} className="ss-rm-topic-block">
                        {item.title ? (
                          <p className="ss-rm-topic-item">
                            <strong className="ss-rm-topic-title">
                              {item.title}:{" "}
                            </strong>
                            <span className="ss-rm-topic-desc">
                              {item.desc}
                            </span>
                          </p>
                        ) : (
                          <p className="ss-rm-topic-item">
                            <span className="ss-rm-topic-desc">
                              {item.desc}
                            </span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. Target Skills Pills */}
                {phase.skills.length > 0 && (
                  <div className="ss-rm-skills-wrap">
                    <span className="ss-rm-skills-label">Target Skills:</span>
                    {phase.skills.map((skill, skIdx) => (
                      <span key={skIdx} className="ss-rm-skill-pill">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Defensive fallback: if parsing yielded no phases, render original styled response cleanly
    return <div className="ss-rm-raw-box">{aiReport}</div>;
  };

  return (
    <AppLayout>
      <div className="ss-dashboard" style={{ maxWidth: 1100 }}>
        {/* Header Section */}
        <div className="ss-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <h1 className="ss-welcome">🗺️ AI Personalized Career Roadmap</h1>
            <p className="ss-streak">
              Dynamically calculated career roadmap tailored to{" "}
              {user?.name || "your profile"} based on real course enrollments &
              progress.
            </p>
          </div>
        </div>

        {/* State 1: Initial Selection & Empty State (No Roadmap initially) */}
        {!hasGenerated && (
          <div className="ss-rm-empty-container">
            <div className="ss-rm-badge-pill">
              <span>✨</span>
              <span>AI Career Engine</span>
            </div>
            <h2 className="ss-rm-empty-title">Define Your Career Path</h2>
            <p className="ss-rm-empty-subtitle">
              Select a target role or enter your dream engineering path to
              generate a step-by-step AI milestone roadmap.
            </p>

            {/* Centered Role Cards */}
            <div className="ss-rm-role-grid">
              {roleOptions.map((item) => (
                <div
                  key={item.id}
                  className={`ss-rm-role-card ${selectedRole === item.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedRole(item.id);
                    setCustomRole("");
                  }}
                >
                  <span className="ss-rm-role-icon">{item.icon}</span>
                  <span className="ss-rm-role-label">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Custom Role Input / Select Dropdown fallback */}
            <div className="ss-rm-custom-input-wrap">
              <select
                className="ss-rm-select-custom"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  if (e.target.value !== "Custom") setCustomRole("");
                }}
              >
                <option value="" disabled>
                  -- Or Choose From List --
                </option>
                {roleOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
                <option value="Custom">Other Custom Role...</option>
              </select>

              {selectedRole === "Custom" && (
                <input
                  type="text"
                  className="ss-rm-select-custom"
                  placeholder="e.g. Data Scientist / ML Engineer"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              )}
            </div>

            <button
              className="ss-rm-generate-btn"
              disabled={loading || (!selectedRole && !customRole)}
              onClick={() => generateRoadmap(activeRoleName)}
            >
              {loading ? (
                <>⏳ Generating Personalized Path...</>
              ) : (
                <>🚀 Generate Career Roadmap</>
              )}
            </button>
          </div>
        )}

        {/* State 2: Active Roadmap View */}
        {hasGenerated && (
          <div>
            {/* Top Toolbar */}
            <div className="ss-rm-active-header">
              <div className="ss-rm-header-info">
                <h2>🎯 Path: {activeRoleName}</h2>
                <div className="ss-rm-header-meta">
                  <span className="ss-rm-meta-item">
                    <span>👤</span> {user?.name || "Student"}
                  </span>
                  <span>•</span>
                  <span className="ss-rm-meta-item">
                    <span>🏁</span>{" "}
                    {parsedPhases.length > 0
                      ? `${parsedPhases.length} Milestones`
                      : "AI Generated"}
                  </span>
                  <span>•</span>
                  <span className="ss-rm-meta-item">
                    <span>✨</span> Tailored to enrollments
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <button className="ss-rm-download-btn" onClick={handlePrint}>
                  📥 Download Roadmap (PDF)
                </button>

                <button
                  className="ss-rm-regen-btn"
                  disabled={loading}
                  onClick={() => generateRoadmap(activeRoleName, true)}
                >
                  {loading ? "Analyzing..." : "✨ Regenerate AI Roadmap"}
                </button>
              </div>
            </div>

            {/* Printable Container wrapper for print support */}
            <div className="ss-rm-printable">
              <div className="no-print" style={{ marginBottom: 12 }}>
                <p
                  style={{ fontSize: "0.85rem", color: "var(--st-text-muted)" }}
                >
                  Step-by-step career path calculated by Enterprise Learning AI:
                </p>
              </div>

              {loading ? (
                <div
                  className="ss-rm-raw-box"
                  style={{ textAlign: "center", padding: "3rem" }}
                >
                  <p style={{ fontSize: "1.1rem", color: "var(--st-sage)" }}>
                    ✨ Calculating optimal learning trajectory for{" "}
                    {activeRoleName}...
                  </p>
                </div>
              ) : (
                renderRoadmapTimeline()
              )}
            </div>
          </div>
        )}

        {/* Modal / Popup Overlay for Regenerate Experience */}
        {isModalOpen && (
          <div
            className="ss-rm-modal-backdrop"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="ss-rm-modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ss-rm-modal-header">
                <div className="ss-rm-modal-title-box">
                  <h3>✨ AI-Generated Career Report</h3>
                  <p>Personalized roadmap for {activeRoleName}</p>
                </div>
                <button
                  className="ss-rm-modal-close-btn"
                  onClick={() => setIsModalOpen(false)}
                  title="Close modal"
                >
                  ✕
                </button>
              </div>

              <div className="ss-rm-modal-body">
                <div className="ss-rm-printable">
                  <div
                    style={{
                      marginBottom: 20,
                      paddingBottom: 12,
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        color: "var(--st-text-muted)",
                      }}
                    >
                      <span>
                        Candidate: <strong>{user?.name || "Student"}</strong>
                      </span>
                      <span>
                        Generated:{" "}
                        <strong>{new Date().toLocaleDateString()}</strong>
                      </span>
                    </div>
                  </div>

                  {loading ? (
                    <div
                      style={{
                        padding: "3rem 1rem",
                        textAlign: "center",
                        color: "var(--st-sage)",
                      }}
                    >
                      <p>✨ Regenerating AI Career Analysis...</p>
                    </div>
                  ) : (
                    renderRoadmapTimeline()
                  )}
                </div>
              </div>

              <div className="ss-rm-modal-footer">
                <button className="ss-rm-download-btn" onClick={handlePrint}>
                  📥 Download Roadmap (PDF)
                </button>

                <button
                  className="ss-rm-regen-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
