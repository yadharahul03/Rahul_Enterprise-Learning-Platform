import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import api from "../api/client";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [scoreResult, setScoreResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadAllQuizzes = async () => {
    try {
      setLoading(true);
      const enrolledCourses = await api.get("/courses");
      const userEnrolled = (enrolledCourses || []).filter((c) => c.enrolled);

      const quizList = [];
      for (const course of userEnrolled) {
        try {
          const lessons = await api.get(`/courses/${course.id}/lessons`);
          const quizLessons = (lessons || []).filter((l) => l.type === "QUIZ");
          for (const ql of quizLessons) {
            quizList.push({
              id: ql.id,
              courseId: course.id,
              courseTitle: course.title,
              title: ql.title,
              completed: ql.completed,
              questions: ql.questions || [],
              totalQuestions: (ql.questions || []).length,
            });
          }
        } catch {
          // ignore error per course
        }
      }
      setQuizzes(quizList);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllQuizzes();
  }, []);

  const handleStartQuiz = (q) => {
    setActiveQuiz(q);
    setSelectedAnswers({});
    setScoreResult(null);
  };

  const handleSelectOption = (questionId, optionIdx) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    const answers = activeQuiz.questions.map((q) => selectedAnswers[q.id]);
    if (answers.some((a) => a === undefined)) {
      alert("Please answer every question before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.post(`/lessons/${activeQuiz.id}/submit-quiz`, { answers });
      setScoreResult({
        score: result.correctCount,
        total: result.totalQuestions,
        percentage: result.scorePercent,
        passed: result.passed,
        newBadgeEarned: result.newBadgeEarned,
      });
      await loadAllQuizzes();
    } catch (err) {
      alert(err.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="ss-dashboard" style={{ maxWidth: 1050 }}>
        <div className="ss-header" style={{ marginBottom: "1.25rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--st-emerald)", fontWeight: 700 }}>
              COURSE KNOWLEDGE ASSESSMENTS
            </span>
            <h1 className="ss-welcome">🧪 Quizzes & Knowledge Checks</h1>
            <p className="ss-streak">Quizzes aggregated across your enrolled courses. Test your mastery, pass with &ge;70%, and earn badges!</p>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "var(--st-text-muted)" }}>Loading course quizzes...</p>
        ) : activeQuiz ? (
          /* Active Quiz Execution View */
          <div className="ss-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid var(--st-border)", paddingBottom: 12 }}>
              <div>
                <span className="ss-badge-tech">{activeQuiz.courseTitle}</span>
                <h2 style={{ margin: "6px 0 0 0", fontSize: "1.25rem" }}>{activeQuiz.title}</h2>
              </div>
              <button className="ss-chip" onClick={() => setActiveQuiz(null)}>← Back to Quizzes</button>
            </div>

            {scoreResult ? (
              /* Quiz Score Result View */
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <div style={{ fontSize: "3rem" }}>{scoreResult.passed ? "🎉" : "📚"}</div>
                <h2 style={{ margin: "10px 0 4px 0" }}>
                  {scoreResult.passed ? "Quiz Passed with Excellence!" : "Not quite — review the module material and try again!"}
                </h2>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: scoreResult.passed ? "var(--st-emerald)" : "#f59e0b", margin: "12px 0" }}>
                  {scoreResult.score} / {scoreResult.total} ({scoreResult.percentage}%)
                </div>
                {scoreResult.newBadgeEarned && (
                  <div style={{ background: "rgba(245, 158, 11, 0.15)", border: "1px solid #f59e0b", borderRadius: 8, padding: 10, display: "inline-block", color: "#f59e0b", fontWeight: 700, margin: "8px 0" }}>
                    New Badge Awarded: {scoreResult.newBadgeEarned}
                  </div>
                )}
                <p style={{ fontSize: "0.88rem", color: "var(--st-text-muted)", marginTop: 8 }}>
                  XP and module completion metrics have been updated for your profile.
                </p>
                <button className="ss-resume-btn" onClick={() => setActiveQuiz(null)} style={{ marginTop: 16 }}>
                  Continue Learning →
                </button>
              </div>
            ) : (
              /* Questions Form */
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {activeQuiz.questions.map((q, idx) => (
                  <div key={q.id} style={{ background: "var(--st-surface)", padding: 16, borderRadius: 10, border: "1px solid var(--st-border)" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "0.98rem" }}>
                      Q{idx + 1}. {q.questionText}
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            borderRadius: 8,
                            border: `1px solid ${selectedAnswers[q.id] === optIdx ? "var(--st-emerald)" : "var(--st-border)"}`,
                            background: selectedAnswers[q.id] === optIdx ? "rgba(16, 185, 129, 0.08)" : "transparent",
                            cursor: "pointer",
                            fontSize: "0.88rem"
                          }}
                        >
                          <input type="radio" name={`quiz-q-${q.id}`} checked={selectedAnswers[q.id] === optIdx} onChange={() => {}} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  className="ss-resume-btn"
                  onClick={handleSubmitQuiz}
                  disabled={submitting || Object.keys(selectedAnswers).length < activeQuiz.questions.length}
                  style={{ padding: "12px", width: "100%", fontSize: "0.95rem" }}
                >
                  {submitting ? "Grading..." : "Submit Answers & Calculate Score"}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Quiz List View */
          quizzes.length === 0 ? (
            <p style={{ color: "var(--st-text-muted)" }}>No quizzes found for your enrolled courses.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
              {quizzes.map((q) => (
                <div key={q.id} className="ss-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span className="ss-badge-tech">{q.courseTitle}</span>
                    {q.completed && (
                      <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.15)", color: "var(--st-emerald)", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
                        PASSED ✓
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: "6px 0 6px 0", fontSize: "1.1rem" }}>{q.title}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--st-text-muted)", margin: "0 0 16px 0" }}>
                    {q.totalQuestions} Questions • Multiple Choice • Instant Grading (&ge;70% to pass)
                  </p>
                  <button className="ss-resume-btn" onClick={() => handleStartQuiz(q)} style={{ width: "100%" }}>
                    {q.completed ? "Retake Quiz →" : "Start Quiz →"}
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </AppLayout>
  );
}
