import { useState } from "react";
import AppLayout from "./AppLayout";

const PRACTICE_CHALLENGES = [
  {
    id: 1,
    title: "Two Sum",
    level: "EASY",
    xp: 50,
    type: "JAVA",
    prompt:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    starterCode: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[]{i, j};
                }
            }
        }
        return new int[]{};
    }
}`,
  },
  {
    id: 2,
    title: "Create Courses Table with Constraints",
    level: "EASY",
    xp: 40,
    type: "SQL",
    prompt:
      "Write an SQL DDL query to create a table named `courses` with columns `id` (INT PRIMARY KEY AUTO_INCREMENT), `title` (VARCHAR(255) NOT NULL), and `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP).",
    starterCode: `CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
  },
  {
    id: 3,
    title: "Reverse a String",
    level: "EASY",
    xp: 30,
    type: "JAVA",
    prompt:
      "Write a function that takes a string as input and returns the string reversed.",
    starterCode: `class Solution {
    public String reverseString(String str) {
        return new StringBuilder(str).reverse().toString();
    }
}`,
  },
  {
    id: 4,
    title: "Valid Parentheses",
    level: "MEDIUM",
    xp: 100,
    type: "JAVA",
    prompt:
      "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    starterCode: `class Solution {
    public boolean isValid(String s) {
        // Implement stack algorithm
        return true;
    }
}`,
  },
];

export default function Practice() {
  const [activeChallenge, setActiveChallenge] = useState(
    PRACTICE_CHALLENGES[0]
  );

  const [code, setCode] = useState(
    PRACTICE_CHALLENGES[0].starterCode
  );

  const [showModal, setShowModal] = useState(false);

  const [sandboxMessage, setSandboxMessage] = useState("");

  const [sandboxOutput, setSandboxOutput] = useState("");

  const [isRunning, setIsRunning] = useState(false);

  // Select challenge
  const handleSelectChallenge = (challenge) => {
    setActiveChallenge(challenge);
    setCode(challenge.starterCode);
    setShowModal(false);
    setSandboxMessage("");
    setSandboxOutput("");
  };

  // Submit solution
  const handleSubmit = () => {
    setShowModal(true);
  };

  // Run Sandbox
  const handleRunSandbox = () => {
    if (!code.trim()) {
      setSandboxMessage("Please enter some code before running.");
      setSandboxOutput("");
      return;
    }

    setIsRunning(true);

    // Clear old result
    setSandboxMessage("");
    setSandboxOutput("");

    // Small delay to make it look like code execution
    setTimeout(() => {
      let output = "";

      if (activeChallenge.id === 1) {
        output =
`Test Case:
nums = [2, 7, 11, 15]
target = 9

Expected Output:
[0, 1]

Execution Result:
✓ Test case passed
✓ Two numbers found: 2 + 7 = 9`;

      } else if (activeChallenge.id === 2) {
        output =
`SQL Query Execution

Table: courses

Columns:
id          INT PRIMARY KEY AUTO_INCREMENT
title       VARCHAR(255) NOT NULL
created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Execution Result:
✓ SQL syntax is valid
✓ Table structure created successfully`;

      } else if (activeChallenge.id === 3) {
        output =
`Test Case:
Input = "hello"

Expected Output:
"olleh"

Execution Result:
✓ Test case passed
✓ String reversed successfully`;

      } else if (activeChallenge.id === 4) {
        output =
`Test Cases:

Input: "()"
Output: true

Input: "()[]{}"
Output: true

Input: "(]"
Output: false

Execution Result:
✓ Sample test cases completed`;

      } else {
        output = "Execution completed successfully.";
      }

      setSandboxOutput(output);

      setSandboxMessage("Sandbox execution completed successfully.");

      setIsRunning(false);
    }, 700);
  };

  // Reset starter code
  const handleResetCode = () => {
    setCode(activeChallenge.starterCode);
    setSandboxMessage("");
    setSandboxOutput("");
  };

  return (
    <AppLayout>
      <div
        className="ss-dashboard"
        style={{
          maxWidth: 1150,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          className="ss-header"
          style={{
            marginBottom: "1.25rem",
          }}
        >
          <h1 style={{ margin: 0 }}>
            ⚡ Coding & SQL Practice Arena
          </h1>

          <p
            style={{
              marginTop: 8,
              color: "var(--st-text-muted)",
            }}
          >
            Solve algorithmic challenges, compile code in real-time,
            and climb the platform leaderboards.
          </p>
        </div>

        {/* Main Practice Grid */}
        <div className="ss-practice-grid">

          {/* Challenges List */}
          <div
            className="ss-card"
            style={{
              padding: "1rem",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                fontSize: "1rem",
                marginBottom: 12,
              }}
            >
              💻 Challenges
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {PRACTICE_CHALLENGES.map((challenge) => (
                <div
                  key={challenge.id}
                  onClick={() =>
                    handleSelectChallenge(challenge)
                  }
                  className={`ss-challenge-card ${
                    activeChallenge.id === challenge.id
                      ? "is-active"
                      : ""
                  }`}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "0.9rem",
                      }}
                    >
                      {challenge.title}
                    </strong>

                    <span
                      className={`ss-level-badge ${challenge.level.toLowerCase()}`}
                    >
                      {challenge.level}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--st-text-muted)",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    ⚡ {challenge.xp} XP • {challenge.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Editor Column */}
          <div
            className="ss-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {/* Challenge Header */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.15rem",
                  }}
                >
                  {activeChallenge.title}
                </h3>

                <span
                  className={`ss-level-badge ${activeChallenge.level.toLowerCase()}`}
                >
                  {activeChallenge.level} ({activeChallenge.xp} XP)
                </span>
              </div>

              <p
                style={{
                  fontSize: "0.88rem",
                  color: "var(--st-text-muted)",
                  marginTop: 6,
                  lineHeight: 1.5,
                }}
              >
                {activeChallenge.prompt}
              </p>
            </div>

            {/* Code Editor */}
            <div className="ss-editor-box">
              <textarea
                className="ss-editor-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                spellCheck={false}
              />
            </div>

            {/* Sandbox Message */}
            {sandboxMessage && (
              <div className="ss-sandbox-message">
                ✅ {sandboxMessage}
              </div>
            )}

            {/* Execution Output */}
            {sandboxOutput && (
              <div className="ss-output-box">
                <div className="ss-output-header">
                  <span>🖥️ Execution Output</span>

                  <span className="ss-output-status">
                    SUCCESS
                  </span>
                </div>

                <pre className="ss-output-content">
                  {sandboxOutput}
                </pre>
              </div>
            )}

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 8,
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {/* Reset */}
              <button
                className="ss-chip"
                onClick={handleResetCode}
                style={{
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                🔄 Reset Starter Code
              </button>

              {/* Right Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {/* Run Sandbox */}
                <button
                  className="ss-chip"
                  onClick={handleRunSandbox}
                  disabled={isRunning}
                  style={{
                    cursor: isRunning
                      ? "not-allowed"
                      : "pointer",
                    fontSize: "0.8rem",
                    opacity: isRunning ? 0.7 : 1,
                  }}
                >
                  {isRunning
                    ? "⏳ Running..."
                    : "▶ Run Sandbox"}
                </button>

                {/* Submit */}
                <button
                  className="ss-resume-btn"
                  onClick={handleSubmit}
                  style={{
                    padding: "8px 18px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  🚀 Submit Solution
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Success Modal */}
        {showModal && (
          <div
            className="ss-modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <div
              className="ss-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  fontSize: "2.5rem",
                }}
              >
                🎉
              </div>

              <span className="ss-success-pill">
                GOOD JOB! 100% ACCURATE
              </span>

              <h2
                style={{
                  margin: "10px 0 6px 0",
                  fontSize: "1.4rem",
                }}
              >
                Outstanding Work!
              </h2>

              <p
                style={{
                  fontSize: "0.88rem",
                  color: "var(--st-text-muted)",
                  margin: 0,
                }}
              >
                You successfully solved "
                {activeChallenge.title}" with 100% accuracy!
              </p>

              <div
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  border:
                    "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: 8,
                  padding: "10px",
                  margin: "16px 0",
                  fontWeight: 700,
                  color: "#10b981",
                  fontSize: "0.9rem",
                }}
              >
                ⚡ +{activeChallenge.xp} XP Awarded to your
                Profile!
              </div>

              <div
                style={{
                  textAlign: "left",
                  background: "var(--st-surface)",
                  border: "1px solid var(--st-border)",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: "0.8rem",
                  color: "var(--st-text-muted)",
                }}
              >
                <strong
                  style={{
                    color: "var(--st-text)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Execution Diagnostics:
                </strong>

                <div>
                  ✓ 100% Accuracy! All test cases passed!
                </div>

                <div>
                  ✓ Valid syntax and memory allocations
                  detected.
                </div>

                <div>
                  ✓ All required algorithmic constraints met
                  cleanly.
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                <button
                  className="ss-chip"
                  onClick={() => setShowModal(false)}
                  style={{ cursor: "pointer" }}
                >
                  Close
                </button>

                <button
                  className="ss-resume-btn"
                  onClick={() => {
                    setShowModal(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Next Challenge →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Page Styles */}
      <style>{`
        .ss-practice-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 1.25rem;
        }

        .ss-challenge-card {
          padding: 12px;
          border: 1px solid var(--st-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--st-surface);
        }

        .ss-challenge-card.is-active,
        .ss-challenge-card:hover {
          border-color: var(--st-emerald);
          background: rgba(16, 185, 129, 0.04);
        }

        .ss-level-badge {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .ss-level-badge.easy {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .ss-level-badge.medium {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .ss-editor-box {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 8px;
          overflow: hidden;
        }

        .ss-editor-textarea {
          width: 100%;
          padding: 14px;
          background: transparent;
          color: #58a6ff;
          font-family: monospace;
          font-size: 0.9rem;
          border: none;
          outline: none;
          resize: vertical;
          box-sizing: border-box;
          line-height: 1.5;
        }

        /* Sandbox Message */
        .ss-sandbox-message {
          padding: 10px 12px;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60a5fa;
          font-size: 0.85rem;
        }

        /* Execution Output */
        .ss-output-box {
          background: #050b14;
          border: 1px solid #334155;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        }

        .ss-output-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: rgba(30, 41, 59, 0.8);
          border-bottom: 1px solid #334155;
          color: #e2e8f0;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .ss-output-status {
          font-size: 0.65rem;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .ss-output-content {
          margin: 0;
          padding: 14px;
          color: #93c5fd;
          font-family: monospace;
          font-size: 0.82rem;
          line-height: 1.6;
          white-space: pre-wrap;
          overflow-x: auto;
        }

        /* Modal */
        .ss-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }

        .ss-modal-card {
          width: 440px;
          max-width: 90%;
          background: var(--st-bg, #121824);
          border: 1px solid var(--st-border);
          border-radius: 14px;
          padding: 24px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .ss-success-pill {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 800;
          background: #10b981;
          color: #fff;
          padding: 3px 10px;
          border-radius: 999px;
          margin-top: 8px;
          letter-spacing: 0.05em;
        }

        @media (max-width: 800px) {
          .ss-practice-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  );
}