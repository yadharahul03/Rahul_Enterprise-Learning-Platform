import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import Navbar from "./Navbar";
import "./Dashboard.css";
import "./CourseLearn.css";

export default function CourseLearn() {
  const { courseId } = useParams();
  const { token } = useAuth();
  const [lessons, setLessons] = useState(null);
  const [error, setError] = useState("");
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [busy, setBusy] = useState(false);

  // Quiz-in-progress state: selected option index per question, keyed by question id
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const loadLessons = async (keepActive) => {
    try {
      const data = await api.get(`/courses/${courseId}/lessons`);
      setLessons(data);
      if (!keepActive && data.length > 0) {
        setActiveLessonId(data[0].id);
      }
    } catch (err) {
      setError("Could not load this course. Is the backend running?");
    }
  };

  useEffect(() => {
    if (token) loadLessons(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, courseId]);

  const activeLesson = lessons?.find((l) => l.id === activeLessonId);

  const handleSelectLesson = (lessonId) => {
    setActiveLessonId(lessonId);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleMarkComplete = async () => {
    setBusy(true);
    try {
      await api.post(`/lessons/${activeLessonId}/complete`);
      await loadLessons(true);
    } catch (err) {
      alert(err.message || "Failed to mark complete");
    } finally {
      setBusy(false);
    }
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    const answers = activeLesson.questions.map((q) => quizAnswers[q.id]);
    if (answers.some((a) => a === undefined)) {
      alert("Please answer every question before submitting.");
      return;
    }

    setBusy(true);
    try {
      const result = await api.post(`/lessons/${activeLessonId}/submit-quiz`, { answers });
      setQuizResult(result);
      if (result.passed) {
        await loadLessons(true);
      }
    } catch (err) {
      alert(err.message || "Failed to submit quiz");
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <>
        <Navbar />
        <div className="ss-dashboard">{error}</div>
      </>
    );
  }

  if (!lessons) {
    return (
      <>
        <Navbar />
        <div className="ss-dashboard">Loading course...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="cl-wrap">
        {/* Sidebar */}
        <aside className="cl-sidebar">
          <h3 className="cl-sidebar-title">Lessons</h3>
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              className={`cl-lesson-btn ${lesson.id === activeLessonId ? "active" : ""}`}
              onClick={() => handleSelectLesson(lesson.id)}
            >
              <span className="cl-lesson-check">{lesson.completed ? "✓" : lesson.orderIndex + 1}</span>
              <span className="cl-lesson-btn-title">{lesson.title}</span>
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="cl-main">
          {activeLesson && activeLesson.type === "VIDEO" && (
            <div>
              <h2 className="cl-lesson-heading">{activeLesson.title}</h2>
              <video controls className="cl-video" src={activeLesson.videoUrl} />
              <button
                className="ss-resume-btn"
                style={{ marginTop: "16px" }}
                disabled={activeLesson.completed || busy}
                onClick={handleMarkComplete}
              >
                {activeLesson.completed ? "Completed" : busy ? "Saving..." : "Mark as complete"}
              </button>
            </div>
          )}

          {activeLesson && activeLesson.type === "READING" && (
            <div>
              <h2 className="cl-lesson-heading">{activeLesson.title}</h2>
              <p className="cl-reading-text">{activeLesson.content}</p>
              <button
                className="ss-resume-btn"
                style={{ marginTop: "16px" }}
                disabled={activeLesson.completed || busy}
                onClick={handleMarkComplete}
              >
                {activeLesson.completed ? "Completed" : busy ? "Saving..." : "Mark as complete"}
              </button>
            </div>
          )}

          {activeLesson && activeLesson.type === "QUIZ" && (
            <div>
              <h2 className="cl-lesson-heading">{activeLesson.title}</h2>
              {activeLesson.questions.map((q, qi) => (
                <div key={q.id} className="cl-question">
                  <p className="cl-question-text">
                    {qi + 1}. {q.questionText}
                  </p>
                  {q.options.map((opt, oi) => (
                    <label key={oi} className="cl-option">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        checked={quizAnswers[q.id] === oi}
                        onChange={() => handleSelectAnswer(q.id, oi)}
                        disabled={activeLesson.completed}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ))}

              {!activeLesson.completed && (
                <button
                  className="ss-resume-btn"
                  style={{ marginTop: "10px" }}
                  disabled={busy}
                  onClick={handleSubmitQuiz}
                >
                  {busy ? "Grading..." : "Submit Quiz"}
                </button>
              )}

              {quizResult && (
                <p className={`cl-quiz-result ${quizResult.passed ? "pass" : "fail"}`}>
                  {quizResult.correctCount}/{quizResult.totalQuestions} correct ({quizResult.scorePercent}%)
                  {" — "}
                  {quizResult.passed ? "Passed!" : "Not quite — try again."}
                </p>
              )}

              {activeLesson.completed && !quizResult && (
                <p className="cl-quiz-result pass">Already passed this quiz.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
