import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../api/client";
import AppLayout from "./AppLayout";
import { SkeletonGrid } from "./Skeleton";
import "./Dashboard.css";

const LESSON_TYPES = ["VIDEO", "READING", "QUIZ"];
const EMPTY_LESSON = { title: "", type: "VIDEO", videoUrl: "", content: "" };
const EMPTY_QUESTION = { questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: 0 };

export default function InstructorCourseLessons() {
  const { courseId } = useParams();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [lessons, setLessons] = useState(null);
  const [error, setError] = useState("");
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);
  const [saving, setSaving] = useState(false);
  const [openLessonId, setOpenLessonId] = useState(null);
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION);
  const [addingQuestionTo, setAddingQuestionTo] = useState(null);

  const load = async () => {
    try {
      const data = await api.get(`/instructor/courses/${courseId}/lessons`);
      setLessons(data);
    } catch (err) {
      setError(err.message || "Could not load lessons.");
    }
  };

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, courseId]);

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/instructor/courses/${courseId}/lessons`, lessonForm);
      showToast?.("Lesson added", "success");
      setShowLessonForm(false);
      setLessonForm(EMPTY_LESSON);
      await load();
    } catch (err) {
      showToast?.(err.message || "Could not create lesson", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lesson) => {
    if (!window.confirm(`Delete "${lesson.title}"? This removes any quiz questions and student progress for it too.`)) return;
    try {
      await api.delete(`/instructor/lessons/${lesson.id}`);
      showToast?.("Lesson deleted", "success");
      await load();
    } catch (err) {
      showToast?.(err.message || "Could not delete lesson", "error");
    }
  };

  const handleAddQuestion = async (e, lessonId) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/instructor/lessons/${lessonId}/questions`, questionForm);
      showToast?.("Question added", "success");
      setQuestionForm(EMPTY_QUESTION);
      setAddingQuestionTo(null);
      await load();
    } catch (err) {
      showToast?.(err.message || "Could not add question", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await api.delete(`/instructor/questions/${questionId}`);
      await load();
    } catch (err) {
      showToast?.(err.message || "Could not delete question", "error");
    }
  };

  if (error) {
    return (
      <AppLayout>
        <div className="ss-dashboard">{error}</div>
      </AppLayout>
    );
  }

  if (!lessons) {
    return (
      <AppLayout>
        <div className="ss-dashboard"><SkeletonGrid count={3} /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="ss-dashboard">
        <Link to="/instructor" className="ss-cd-back">&larr; Instructor Dashboard</Link>
        <div className="ss-header" style={{ marginTop: 10 }}>
          <h1 className="ss-welcome">Lessons</h1>
          <button className="ss-resume-btn" onClick={() => setShowLessonForm((v) => !v)}>
            {showLessonForm ? "Cancel" : "+ Add lesson"}
          </button>
        </div>

        {showLessonForm && (
          <div className="ss-instr-form-card">
            <form onSubmit={handleAddLesson} className="ss-instr-form">
              <div>
                <label className="ss-instr-label">Title</label>
                <input className="ss-instr-input" required value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
              </div>
              <div>
                <label className="ss-instr-label">Type</label>
                <select className="ss-instr-input" value={lessonForm.type}
                  onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}>
                  {LESSON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {lessonForm.type === "VIDEO" && (
                <div>
                  <label className="ss-instr-label">Video URL</label>
                  <input className="ss-instr-input" value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} placeholder="https://..." />
                </div>
              )}
              {lessonForm.type === "READING" && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="ss-instr-label">Content</label>
                  <textarea className="ss-instr-input" rows={4} value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} />
                </div>
              )}
              {lessonForm.type === "QUIZ" && (
                <p style={{ gridColumn: "1 / -1", fontSize: 12, color: "var(--st-text-muted)" }}>
                  Create the lesson first, then add quiz questions to it below.
                </p>
              )}
              <div className="ss-instr-form-actions">
                <button type="submit" className="ss-resume-btn" disabled={saving}>{saving ? "Saving..." : "Add lesson"}</button>
              </div>
            </form>
          </div>
        )}

        {lessons.length === 0 ? (
          <p style={{ color: "var(--st-text-muted)", fontSize: 14 }}>No lessons yet — add your first one above.</p>
        ) : (
          <div className="ss-lesson-list">
            {lessons.map((l) => (
              <div key={l.id} className="ss-lesson-item">
                <div className="ss-lesson-row">
                  <span className="ss-lesson-order">{l.orderIndex}</span>
                  <span className="ss-lesson-type-pill">{l.type}</span>
                  <span className="ss-lesson-title">{l.title}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {l.type === "QUIZ" && (
                      <button className="ss-instr-small-btn" onClick={() => setOpenLessonId(openLessonId === l.id ? null : l.id)}>
                        {openLessonId === l.id ? "Hide questions" : `Questions (${l.questions?.length || 0})`}
                      </button>
                    )}
                    <button className="ss-instr-small-btn ss-instr-danger" onClick={() => handleDeleteLesson(l)}>Delete</button>
                  </div>
                </div>

                {l.type === "QUIZ" && openLessonId === l.id && (
                  <div className="ss-lesson-quiz-panel">
                    {(l.questions || []).map((q) => (
                      <div key={q.id} className="ss-quiz-question-row">
                        <div>
                          <p className="ss-quiz-question-text">{q.questionText}</p>
                          <p className="ss-quiz-options">
                            {["A", "B", "C", "D"].map((label, i) => (
                              <span key={label} className={i === q.correctOption ? "is-correct" : ""}>
                                {label}: {[q.optionA, q.optionB, q.optionC, q.optionD][i]}
                              </span>
                            ))}
                          </p>
                        </div>
                        <button className="ss-instr-small-btn ss-instr-danger" onClick={() => handleDeleteQuestion(q.id)}>Delete</button>
                      </div>
                    ))}

                    {addingQuestionTo === l.id ? (
                      <form onSubmit={(e) => handleAddQuestion(e, l.id)} className="ss-instr-form" style={{ marginTop: 10 }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label className="ss-instr-label">Question</label>
                          <input className="ss-instr-input" required value={questionForm.questionText}
                            onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })} />
                        </div>
                        {["A", "B", "C", "D"].map((label) => {
                          const key = `option${label}`;
                          return (
                            <div key={label}>
                              <label className="ss-instr-label">Option {label}</label>
                              <input className="ss-instr-input" required value={questionForm[key]}
                                onChange={(e) => setQuestionForm({ ...questionForm, [key]: e.target.value })} />
                            </div>
                          );
                        })}
                        <div>
                          <label className="ss-instr-label">Correct option</label>
                          <select className="ss-instr-input" value={questionForm.correctOption}
                            onChange={(e) => setQuestionForm({ ...questionForm, correctOption: Number(e.target.value) })}>
                            {["A", "B", "C", "D"].map((label, i) => <option key={label} value={i}>{label}</option>)}
                          </select>
                        </div>
                        <div className="ss-instr-form-actions">
                          <button type="submit" className="ss-resume-btn" disabled={saving}>{saving ? "Saving..." : "Add question"}</button>
                          <button type="button" className="ss-instr-cancel" onClick={() => setAddingQuestionTo(null)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button className="ss-instr-small-btn" style={{ marginTop: 10 }} onClick={() => { setQuestionForm(EMPTY_QUESTION); setAddingQuestionTo(l.id); }}>
                        + Add question
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>
        {`
          .ss-lesson-list { display: flex; flex-direction: column; gap: 10px; }
          .ss-lesson-item { background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 14px; padding: 14px 18px; }
          .ss-lesson-row { display: flex; align-items: center; gap: 12px; }
          .ss-lesson-order { color: var(--st-text-muted); font-size: 12px; width: 18px; }
          .ss-lesson-type-pill { background: rgba(124,108,246,0.14); color: var(--st-orange-light); font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; }
          .ss-lesson-title { flex: 1; font-size: 14px; color: var(--st-cream); font-weight: 600; }
          .ss-lesson-quiz-panel { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--st-border); }
          .ss-quiz-question-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--st-border); }
          .ss-quiz-question-row:last-child { border-bottom: none; }
          .ss-quiz-question-text { font-size: 13px; color: var(--st-cream); margin-bottom: 4px; }
          .ss-quiz-options { display: flex; flex-wrap: wrap; gap: 10px; font-size: 11.5px; color: var(--st-text-muted); }
          .ss-quiz-options .is-correct { color: var(--st-sage); font-weight: 700; }
        `}
      </style>
    </AppLayout>
  );
}
