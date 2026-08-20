import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const DEFAULT_RESUME_STATE = {
  personalInfo: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
    summary: "",
  },
  education: [
    {
      id: "edu-1",
      institution: "State University of Technology",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science & Engineering",
      location: "San Francisco, CA",
      startDate: "2020",
      endDate: "2024",
      gpa: "3.8 / 4.0",
      details: "Relevant coursework: Data Structures, Distributed Systems, Software Engineering.",
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "Apex Tech Solutions",
      position: "Software Engineering Intern",
      location: "Remote",
      startDate: "Jun 2023",
      endDate: "Dec 2023",
      current: false,
      details: "• Built microservices in Java Spring Boot reducing API latency by 25%.\n• Developed responsive React UI components and integrated RESTful endpoints.\n• Automated CI/CD build pipelines using GitHub Actions.",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Enterprise Learning E-Learning Engine",
      techStack: "React, Spring Boot, MySQL, JWT, OAuth2",
      link: "https://github.com/example/skillsphere",
      description: "Full-stack adaptive learning portal supporting interactive quizzes, analytics dashboards, and automated certificate generation.",
    },
  ],
  skills: {
    languages: "Java, JavaScript (ES6+), TypeScript, SQL, HTML5, CSS3",
    frameworks: "Spring Boot, React, Node.js, Express, JUnit, Hibernate/JPA",
    tools: "Git, Maven, Docker, MySQL, Postman, Vite",
    softSkills: "Problem Solving, Agile Collaboration, Technical Documentation, Adaptability",
  },
  certifications: [
    {
      id: "cert-1",
      name: "Java Backend Summit Certification",
      issuer: "Enterprise Learning",
      date: "2025",
      credentialUrl: "https://skillsphere.org/verify/SP-98213",
    },
  ],
  themeConfig: {
    template: "modern", // "modern" | "classic" | "minimal"
    accentColor: "#0f766e", // Teal default
    fontFamily: "Inter, sans-serif",
  },
};

export default function ResumeBuilder() {
  const { user } = useAuth();
  const toast = useToast();
  const [resumeData, setResumeData] = useState(DEFAULT_RESUME_STATE);
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Load existing resume from backend
  const loadResume = async () => {
    setLoading(true);
    try {
      const res = await api.get("/resume");
      const jsonStr = res?.jsonContent || res?.data?.jsonContent;
      if (jsonStr && jsonStr !== "{}") {
        const parsed = JSON.parse(jsonStr);
        setResumeData((prev) => ({
          ...DEFAULT_RESUME_STATE,
          ...parsed,
          personalInfo: { ...DEFAULT_RESUME_STATE.personalInfo, ...(parsed.personalInfo || {}) },
          skills: { ...DEFAULT_RESUME_STATE.skills, ...(parsed.skills || {}) },
          themeConfig: { ...DEFAULT_RESUME_STATE.themeConfig, ...(parsed.themeConfig || {}) },
        }));
      } else {
        // Pre-fill user details from auth context if available
        if (user) {
          setResumeData((prev) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              fullName: user.name || prev.personalInfo.fullName,
              email: user.email || prev.personalInfo.email,
            },
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load resume:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
  }, []);

  // Save resume to backend
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      await api.put("/resume", {
        jsonContent: JSON.stringify(resumeData),
      });
      setSaveMsg("Resume saved to your profile!");
      if (toast?.addToast) {
        toast.addToast("Resume saved successfully!", "success");
      }
    } catch (err) {
      const errText = err.message || "Failed to save resume";
      setSaveMsg(`Error: ${errText}`);
      if (toast?.addToast) {
        toast.addToast(errText, "error");
      }
    } finally {
      setSaving(false);
    }
  };

  // Sync profile & certifications from backend
  const handleSyncPlatformData = async () => {
    try {
      // 1. Sync User Profile Info
      const currentPersonal = { ...resumeData.personalInfo };
      if (user?.name && !currentPersonal.fullName) currentPersonal.fullName = user.name;
      if (user?.email && !currentPersonal.email) currentPersonal.email = user.email;

      // 2. Fetch Earned Enterprise Learning Certifications
      let fetchedCerts = [];
      try {
        const certRes = await api.get("/certificates/my-certificates");
        const list = Array.isArray(certRes) ? certRes : certRes?.data || [];
        if (list.length > 0) {
          fetchedCerts = list.map((c, idx) => ({
            id: `platform-cert-${c.id || idx}`,
            name: c.courseTitle || c.title || "Enterprise Learning Verified Course Certificate",
            issuer: "Enterprise Learning Platform",
            date: c.issuedAt ? new Date(c.issuedAt).getFullYear().toString() : "2026",
            credentialUrl: c.certificateNumber ? `/verify-certificate/${c.certificateNumber}` : "",
          }));
        }
      } catch (cErr) {
        console.warn("No platform certificates fetched:", cErr);
      }

      // Merge fetched certs avoiding duplicates by name
      const existingCertNames = new Set(resumeData.certifications.map((c) => c.name));
      const newCerts = fetchedCerts.filter((c) => !existingCertNames.has(c.name));

      setResumeData((prev) => ({
        ...prev,
        personalInfo: currentPersonal,
        certifications: [...prev.certifications, ...newCerts],
      }));

      const msg = newCerts.length > 0
        ? `Synced! Added ${newCerts.length} earned certificates from Enterprise Learning.`
        : "Profile synced! (All certificates are already up to date)";

      if (toast?.addToast) toast.addToast(msg, "info");
      setSaveMsg(msg);
    } catch (err) {
      console.error("Sync failed:", err);
      if (toast?.addToast) toast.addToast("Could not sync platform data", "error");
    }
  };

  // Field updates
  const updatePersonalInfo = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const updateSkills = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [field]: value },
    }));
  };

  const updateThemeConfig = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      themeConfig: { ...prev.themeConfig, [field]: value },
    }));
  };

  // Dynamic Array Handlers
  const addArrayItem = (section, templateObj) => {
    const newItem = { ...templateObj, id: `${section}-${Date.now()}` };
    setResumeData((prev) => ({
      ...prev,
      [section]: [...prev[section], newItem],
    }));
  };

  const updateArrayItem = (section, id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: prev[section].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const removeArrayItem = (section, id) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }));
  };

  // Print PDF Trigger
  const handlePrintPdf = () => {
    window.print();
  };

  const { personalInfo, education, experience, projects, skills, certifications, themeConfig } = resumeData;
  const currentTemplate = ["classic", "modern", "minimal"].includes(themeConfig.template)
    ? themeConfig.template
    : "modern";

  return (
    <AppLayout>
      <div className="ss-dashboard ss-resume-container" style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: "3rem" }}>
        
        {/* Header Bar (Hidden during print) */}
        <div className="ss-header no-print" style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="ss-welcome" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>📄</span> Professional Resume Builder
            </h1>
            <p className="ss-streak">
              Craft, customize, auto-import platform achievements, select templates, and export print-ready PDF resumes.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <button className="ss-btn-secondary" onClick={handleSyncPlatformData} title="Auto-import profile and completed certificates">
              ⚡ Sync Platform Certs
            </button>
            <button className="ss-resume-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "💾 Save Resume"}
            </button>
            <button className="ss-btn-primary" onClick={handlePrintPdf} style={{ background: "var(--st-emerald, #0f766e)", color: "#fff", fontWeight: 600 }}>
              🖨️ Download / Print PDF
            </button>
          </div>
        </div>

        {saveMsg && (
          <div className="no-print" style={{ background: "rgba(15, 118, 110, 0.15)", border: "1px solid var(--st-emerald, #0f766e)", padding: "10px 16px", borderRadius: 8, color: "var(--chalk, #fff)", fontSize: "0.88rem", marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{saveMsg}</span>
            <button onClick={() => setSaveMsg("")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1.1rem" }}>×</button>
          </div>
        )}

        {/* Main Grid: Left Editor & Right Live Document */}
        <div className="ss-resume-workspace">
          
          {/* Left Column: Form Editor Controls (Hidden during print) */}
          <div className="ss-card ss-resume-editor no-print" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.25rem" }}>
            
            {/* Section Tabs Header */}
            <div className="ss-resume-tabs">
              {[
                { id: "personal", label: "👤 Personal" },
                { id: "education", label: "🎓 Education" },
                { id: "experience", label: "💼 Experience" },
                { id: "projects", label: "🚀 Projects" },
                { id: "skills", label: "⚡ Skills" },
                { id: "certifications", label: "🏆 Certs" },
                { id: "theme", label: "🎨 Theme" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`ss-tab-item ${activeTab === tab.id ? "is-active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: Personal Info */}
            {activeTab === "personal" && (
              <div className="ss-form-section">
                <h3 className="ss-section-subhead">Personal & Contact Details</h3>
                <div className="ss-field-grid">
                  <div>
                    <label className="ss-label">Full Name</label>
                    <input className="ss-input" value={personalInfo.fullName} onChange={(e) => updatePersonalInfo("fullName", e.target.value)} placeholder="e.g. Alex Morgan" />
                  </div>
                  <div>
                    <label className="ss-label">Professional Title</label>
                    <input className="ss-input" value={personalInfo.title} onChange={(e) => updatePersonalInfo("title", e.target.value)} placeholder="e.g. Full Stack Developer" />
                  </div>
                  <div>
                    <label className="ss-label">Email</label>
                    <input className="ss-input" type="email" value={personalInfo.email} onChange={(e) => updatePersonalInfo("email", e.target.value)} placeholder="alex@example.com" />
                  </div>
                  <div>
                    <label className="ss-label">Phone Number</label>
                    <input className="ss-input" value={personalInfo.phone} onChange={(e) => updatePersonalInfo("phone", e.target.value)} placeholder="+1 (555) 019-2834" />
                  </div>
                  <div>
                    <label className="ss-label">Location (City, Country)</label>
                    <input className="ss-input" value={personalInfo.location} onChange={(e) => updatePersonalInfo("location", e.target.value)} placeholder="San Francisco, CA" />
                  </div>
                  <div>
                    <label className="ss-label">LinkedIn URL</label>
                    <input className="ss-input" value={personalInfo.linkedin} onChange={(e) => updatePersonalInfo("linkedin", e.target.value)} placeholder="linkedin.com/in/alexmorgan" />
                  </div>
                  <div>
                    <label className="ss-label">GitHub URL</label>
                    <input className="ss-input" value={personalInfo.github} onChange={(e) => updatePersonalInfo("github", e.target.value)} placeholder="github.com/alexmorgan" />
                  </div>
                  <div>
                    <label className="ss-label">Portfolio Website</label>
                    <input className="ss-input" value={personalInfo.website} onChange={(e) => updatePersonalInfo("website", e.target.value)} placeholder="alexmorgan.dev" />
                  </div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <label className="ss-label">Professional Summary</label>
                  <textarea className="ss-input" rows={4} value={personalInfo.summary} onChange={(e) => updatePersonalInfo("summary", e.target.value)} placeholder="Passionate engineering candidate with expertise in full-stack web applications..." />
                </div>
              </div>
            )}

            {/* TAB CONTENT: Education */}
            {activeTab === "education" && (
              <div className="ss-form-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h3 className="ss-section-subhead" style={{ margin: 0 }}>Education & Qualifications</h3>
                  <button className="ss-btn-add" onClick={() => addArrayItem("education", { institution: "", degree: "", fieldOfStudy: "", location: "", startDate: "", endDate: "", gpa: "", details: "" })}>
                    + Add Education
                  </button>
                </div>

                {education.map((edu, idx) => (
                  <div key={edu.id} className="ss-array-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--chalk)" }}>Item #{idx + 1}</span>
                      <button className="ss-btn-del" onClick={() => removeArrayItem("education", edu.id)}>🗑️ Remove</button>
                    </div>
                    <div className="ss-field-grid">
                      <div>
                        <label className="ss-label">Institution / University</label>
                        <input className="ss-input" value={edu.institution} onChange={(e) => updateArrayItem("education", edu.id, "institution", e.target.value)} placeholder="State University" />
                      </div>
                      <div>
                        <label className="ss-label">Degree</label>
                        <input className="ss-input" value={edu.degree} onChange={(e) => updateArrayItem("education", edu.id, "degree", e.target.value)} placeholder="B.S." />
                      </div>
                      <div>
                        <label className="ss-label">Field of Study</label>
                        <input className="ss-input" value={edu.fieldOfStudy} onChange={(e) => updateArrayItem("education", edu.id, "fieldOfStudy", e.target.value)} placeholder="Computer Science" />
                      </div>
                      <div>
                        <label className="ss-label">Dates (Start - End)</label>
                        <input className="ss-input" value={`${edu.startDate || ''}${edu.startDate && edu.endDate ? ' - ' : ''}${edu.endDate || ''}`} onChange={(e) => {
                          const parts = e.target.value.split("-");
                          updateArrayItem("education", edu.id, "startDate", parts[0]?.trim() || "");
                          updateArrayItem("education", edu.id, "endDate", parts[1]?.trim() || "");
                        }} placeholder="2020 - 2024" />
                      </div>
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                      <label className="ss-label">Honors / Coursework Notes</label>
                      <input className="ss-input" value={edu.details} onChange={(e) => updateArrayItem("education", edu.id, "details", e.target.value)} placeholder="Honors, Dean's List, Key modules..." />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: Experience */}
            {activeTab === "experience" && (
              <div className="ss-form-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h3 className="ss-section-subhead" style={{ margin: 0 }}>Work & Internship Experience</h3>
                  <button className="ss-btn-add" onClick={() => addArrayItem("experience", { company: "", position: "", location: "", startDate: "", endDate: "", current: false, details: "" })}>
                    + Add Experience
                  </button>
                </div>

                {experience.map((exp, idx) => (
                  <div key={exp.id} className="ss-array-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--chalk)" }}>Role #{idx + 1}</span>
                      <button className="ss-btn-del" onClick={() => removeArrayItem("experience", exp.id)}>🗑️ Remove</button>
                    </div>
                    <div className="ss-field-grid">
                      <div>
                        <label className="ss-label">Company / Organization</label>
                        <input className="ss-input" value={exp.company} onChange={(e) => updateArrayItem("experience", exp.id, "company", e.target.value)} placeholder="Company Name" />
                      </div>
                      <div>
                        <label className="ss-label">Role Title</label>
                        <input className="ss-input" value={exp.position} onChange={(e) => updateArrayItem("experience", exp.id, "position", e.target.value)} placeholder="Software Intern" />
                      </div>
                      <div>
                        <label className="ss-label">Start Date</label>
                        <input className="ss-input" value={exp.startDate} onChange={(e) => updateArrayItem("experience", exp.id, "startDate", e.target.value)} placeholder="Jun 2023" />
                      </div>
                      <div>
                        <label className="ss-label">End Date (or Present)</label>
                        <input className="ss-input" value={exp.endDate} onChange={(e) => updateArrayItem("experience", exp.id, "endDate", e.target.value)} placeholder="Present" />
                      </div>
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                      <label className="ss-label">Responsibilities & Key Achievements (bullet points)</label>
                      <textarea className="ss-input" rows={3} value={exp.details} onChange={(e) => updateArrayItem("experience", exp.id, "details", e.target.value)} placeholder="• Developed API endpoints using Java Spring Boot&#10;• Collaborated on frontend React features" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: Projects */}
            {activeTab === "projects" && (
              <div className="ss-form-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h3 className="ss-section-subhead" style={{ margin: 0 }}>Projects & Capstones</h3>
                  <button className="ss-btn-add" onClick={() => addArrayItem("projects", { name: "", techStack: "", link: "", description: "" })}>
                    + Add Project
                  </button>
                </div>

                {projects.map((proj, idx) => (
                  <div key={proj.id} className="ss-array-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--chalk)" }}>Project #{idx + 1}</span>
                      <button className="ss-btn-del" onClick={() => removeArrayItem("projects", proj.id)}>🗑️ Remove</button>
                    </div>
                    <div className="ss-field-grid">
                      <div>
                        <label className="ss-label">Project Title</label>
                        <input className="ss-input" value={proj.name} onChange={(e) => updateArrayItem("projects", proj.id, "name", e.target.value)} placeholder="E-Commerce App" />
                      </div>
                      <div>
                        <label className="ss-label">Tech Stack</label>
                        <input className="ss-input" value={proj.techStack} onChange={(e) => updateArrayItem("projects", proj.id, "techStack", e.target.value)} placeholder="React, Node, MongoDB" />
                      </div>
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                      <label className="ss-label">Repository / Live Link</label>
                      <input className="ss-input" value={proj.link} onChange={(e) => updateArrayItem("projects", proj.id, "link", e.target.value)} placeholder="https://github.com/..." />
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                      <label className="ss-label">Description & Impact</label>
                      <textarea className="ss-input" rows={2} value={proj.description} onChange={(e) => updateArrayItem("projects", proj.id, "description", e.target.value)} placeholder="Engineered authentication system and real-time dashboard..." />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: Skills */}
            {activeTab === "skills" && (
              <div className="ss-form-section">
                <h3 className="ss-section-subhead">Core Competencies & Skills</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <label className="ss-label">Programming Languages</label>
                    <input className="ss-input" value={skills.languages} onChange={(e) => updateSkills("languages", e.target.value)} placeholder="Java, JavaScript, TypeScript, Python, SQL" />
                  </div>
                  <div>
                    <label className="ss-label">Frameworks & Libraries</label>
                    <input className="ss-input" value={skills.frameworks} onChange={(e) => updateSkills("frameworks", e.target.value)} placeholder="Spring Boot, React, Node.js, Express, JUnit" />
                  </div>
                  <div>
                    <label className="ss-label">Tools & Databases</label>
                    <input className="ss-input" value={skills.tools} onChange={(e) => updateSkills("tools", e.target.value)} placeholder="Git, Maven, MySQL, PostgreSQL, Docker, Vite" />
                  </div>
                  <div>
                    <label className="ss-label">Soft Skills & Practices</label>
                    <input className="ss-input" value={skills.softSkills} onChange={(e) => updateSkills("softSkills", e.target.value)} placeholder="Agile Methodologies, Team Collaboration, Problem Solving" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Certifications */}
            {activeTab === "certifications" && (
              <div className="ss-form-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h3 className="ss-section-subhead" style={{ margin: 0 }}>Certifications & Credentials</h3>
                  <button className="ss-btn-add" onClick={() => addArrayItem("certifications", { name: "", issuer: "", date: "", credentialUrl: "" })}>
                    + Add Certification
                  </button>
                </div>

                {certifications.map((cert, idx) => (
                  <div key={cert.id} className="ss-array-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--chalk)" }}>Cert #{idx + 1}</span>
                      <button className="ss-btn-del" onClick={() => removeArrayItem("certifications", cert.id)}>🗑️ Remove</button>
                    </div>
                    <div className="ss-field-grid">
                      <div>
                        <label className="ss-label">Certification Name</label>
                        <input className="ss-input" value={cert.name} onChange={(e) => updateArrayItem("certifications", cert.id, "name", e.target.value)} placeholder="Java Backend Professional" />
                      </div>
                      <div>
                        <label className="ss-label">Issuing Organization</label>
                        <input className="ss-input" value={cert.issuer} onChange={(e) => updateArrayItem("certifications", cert.id, "issuer", e.target.value)} placeholder="Enterprise Learning" />
                      </div>
                      <div>
                        <label className="ss-label">Issue Date / Year</label>
                        <input className="ss-input" value={cert.date} onChange={(e) => updateArrayItem("certifications", cert.id, "date", e.target.value)} placeholder="2026" />
                      </div>
                      <div>
                        <label className="ss-label">Verification URL / Credential ID</label>
                        <input className="ss-input" value={cert.credentialUrl} onChange={(e) => updateArrayItem("certifications", cert.id, "credentialUrl", e.target.value)} placeholder="verify-certificate/SP-123" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: Theme & Design */}
            {activeTab === "theme" && (
              <div className="ss-form-section">
                <h3 className="ss-section-subhead">Template & Document Aesthetics</h3>
                
                {/* Template Selector Section */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="ss-label" style={{ marginBottom: "0.6rem" }}>Select Resume Template</label>
                  <div className="ss-template-cards-grid">
                    {[
                      {
                        id: "classic",
                        name: "Classic",
                        icon: "🏛️",
                        desc: "Centered header, elegant double rule dividers, serif typography for formal & traditional roles.",
                      },
                      {
                        id: "modern",
                        name: "Modern",
                        icon: "✨",
                        desc: "Left accent bar, clean badges, crisp sans-serif headers, ideal for tech & engineering roles.",
                      },
                      {
                        id: "minimal",
                        name: "Minimal",
                        icon: "🍃",
                        desc: "Ultra-sleek lightweight typography, bullet dot titles, generous spacing & high clarity.",
                      },
                    ].map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className={`ss-template-card ${currentTemplate === tmpl.id ? "is-selected" : ""}`}
                        onClick={() => updateThemeConfig("template", tmpl.id)}
                      >
                        <div className="ss-template-card-header">
                          <span className="ss-template-card-icon">{tmpl.icon}</span>
                          <span className="ss-template-card-name">{tmpl.name} Template</span>
                          {currentTemplate === tmpl.id && <span className="ss-template-badge">Active</span>}
                        </div>
                        <p className="ss-template-card-desc">{tmpl.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="ss-label">Accent Highlight Color</label>
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.4rem" }}>
                    {[
                      { color: "#0f766e", name: "Teal" },
                      { color: "#4338ca", name: "Indigo" },
                      { color: "#047857", name: "Emerald" },
                      { color: "#991b1b", name: "Crimson" },
                      { color: "#334155", name: "Slate" },
                    ].map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => updateThemeConfig("accentColor", c.color)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: c.color,
                          border: themeConfig.accentColor === c.color ? "3px solid #ffffff" : "2px solid transparent",
                          cursor: "pointer",
                          boxShadow: themeConfig.accentColor === c.color ? "0 0 10px rgba(255,255,255,0.5)" : "none",
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Live Printable Document Paper with Template Selector */}
          <div className="ss-resume-preview-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* Quick Template Switcher Bar above live preview */}
            <div className="no-print ss-template-selector-bar">
              <span className="ss-template-bar-label">
                🖼️ Template Preview:
              </span>
              <div className="ss-template-btn-group">
                {[
                  { id: "classic", label: "Classic", icon: "🏛️" },
                  { id: "modern", label: "Modern", icon: "✨" },
                  { id: "minimal", label: "Minimal", icon: "🍃" },
                ].map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    className={`ss-template-btn ${currentTemplate === tmpl.id ? "active" : ""}`}
                    onClick={() => updateThemeConfig("template", tmpl.id)}
                  >
                    <span>{tmpl.icon}</span>
                    <strong>{tmpl.label}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="ss-resume-preview-container">
              <div id="ss-resume-paper" className={`ss-resume-paper template-${currentTemplate}`} style={{ "--accent": themeConfig.accentColor }}>
                
                {/* DOCUMENT HEADER */}
                <div className="resume-header">
                  <h1 className="resume-name">{personalInfo.fullName || "Your Full Name"}</h1>
                  {personalInfo.title && <div className="resume-title">{personalInfo.title}</div>}
                  
                  <div className="resume-contact-bar">
                    {personalInfo.email && <span>✉️ {personalInfo.email}</span>}
                    {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
                    {personalInfo.location && <span>📍 {personalInfo.location}</span>}
                    {personalInfo.linkedin && <span>💼 {personalInfo.linkedin}</span>}
                    {personalInfo.github && <span>💻 {personalInfo.github}</span>}
                    {personalInfo.website && <span>🌐 {personalInfo.website}</span>}
                  </div>
                </div>

                {/* SUMMARY */}
                {personalInfo.summary && (
                  <div className="resume-section">
                    <h2 className="resume-section-title">Professional Summary</h2>
                    <p className="resume-summary-text">{personalInfo.summary}</p>
                  </div>
                )}

                {/* TECHNICAL COMPETENCIES / SKILLS */}
                {(skills.languages || skills.frameworks || skills.tools || skills.softSkills) && (
                  <div className="resume-section">
                    <h2 className="resume-section-title">Technical Competencies</h2>
                    <div className="resume-skills-grid">
                      {skills.languages && (
                        <div className="resume-skill-row">
                          <strong>Languages:</strong> <span>{skills.languages}</span>
                        </div>
                      )}
                      {skills.frameworks && (
                        <div className="resume-skill-row">
                          <strong>Frameworks & Libs:</strong> <span>{skills.frameworks}</span>
                        </div>
                      )}
                      {skills.tools && (
                        <div className="resume-skill-row">
                          <strong>Tools & DBs:</strong> <span>{skills.tools}</span>
                        </div>
                      )}
                      {skills.softSkills && (
                        <div className="resume-skill-row">
                          <strong>Soft Skills:</strong> <span>{skills.softSkills}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* WORK EXPERIENCE */}
                {experience.length > 0 && (
                  <div className="resume-section">
                    <h2 className="resume-section-title">Work & Internship Experience</h2>
                    {experience.map((exp) => (
                      <div key={exp.id} className="resume-item">
                        <div className="resume-item-header">
                          <div>
                            <span className="resume-item-bold">{exp.position}</span>
                            {exp.company && <span className="resume-item-sub"> — {exp.company}</span>}
                          </div>
                          <div className="resume-item-date">
                            {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ""}
                          </div>
                        </div>
                        {exp.details && (
                          <pre className="resume-item-details">{exp.details}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* PROJECTS */}
                {projects.length > 0 && (
                  <div className="resume-section">
                    <h2 className="resume-section-title">Projects & Key Capstones</h2>
                    {projects.map((proj) => (
                      <div key={proj.id} className="resume-item">
                        <div className="resume-item-header">
                          <div>
                            <span className="resume-item-bold">{proj.name}</span>
                            {proj.techStack && <span className="resume-tech-badge"> ({proj.techStack})</span>}
                          </div>
                          {proj.link && <div className="resume-item-date">{proj.link}</div>}
                        </div>
                        {proj.description && <p className="resume-item-desc">{proj.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* EDUCATION */}
                {education.length > 0 && (
                  <div className="resume-section">
                    <h2 className="resume-section-title">Education</h2>
                    {education.map((edu) => (
                      <div key={edu.id} className="resume-item">
                        <div className="resume-item-header">
                          <div>
                            <span className="resume-item-bold">{edu.institution}</span>
                            {edu.degree && <span className="resume-item-sub"> — {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</span>}
                          </div>
                          <div className="resume-item-date">
                            {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ""}
                          </div>
                        </div>
                        {edu.details && <p className="resume-item-desc">{edu.details}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* CERTIFICATIONS */}
                {certifications.length > 0 && (
                  <div className="resume-section">
                    <h2 className="resume-section-title">Certifications & Verification</h2>
                    <div className="resume-certs-list">
                      {certifications.map((cert) => (
                        <div key={cert.id} className="resume-cert-item">
                          <div style={{ fontWeight: 600 }}>{cert.name}</div>
                          <div style={{ fontSize: "0.78rem", color: "#475569" }}>
                            {cert.issuer} {cert.date ? `(${cert.date})` : ""} {cert.credentialUrl ? `• ${cert.credentialUrl}` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* COMPONENT STYLES & PRINT MEDIA STYLES */}
      <style>{`
        .ss-resume-workspace {
          display: grid;
          grid-template-columns: 500px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .ss-resume-workspace {
            grid-template-columns: 1fr;
          }
        }

        .ss-resume-tabs {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          background: var(--ridge, rgba(255, 255, 255, 0.05));
          padding: 6px;
          border-radius: 10px;
          border: 1px solid var(--contour, rgba(255,255,255,0.1));
        }

        .ss-tab-item {
          padding: 6px 12px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--chalk-dim, #9aa1c4);
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ss-tab-item:hover {
          color: var(--chalk, #fff);
          background: rgba(255, 255, 255, 0.08);
        }

        .ss-tab-item.is-active {
          color: #fff;
          background: var(--st-emerald, #0f766e);
          font-weight: 600;
        }

        .ss-section-subhead {
          font-size: 0.95rem;
          margin-top: 0;
          margin-bottom: 0.75rem;
          color: var(--chalk, #fff);
          font-weight: 600;
        }

        .ss-field-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        @media (max-width: 600px) {
          .ss-field-grid {
            grid-template-columns: 1fr;
          }
        }

        .ss-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--chalk-dim, #9aa1c4);
          margin-bottom: 4px;
        }

        .ss-input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--contour, rgba(255, 255, 255, 0.15));
          background: var(--surface, rgba(14, 18, 48, 0.8));
          color: var(--chalk, #fff);
          font-size: 0.82rem;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .ss-input:focus {
          outline: none;
          border-color: var(--st-emerald, #0f766e);
        }

        .ss-array-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--contour, rgba(255, 255, 255, 0.1));
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 0.75rem;
        }

        .ss-btn-add {
          padding: 4px 10px;
          font-size: 0.78rem;
          border-radius: 6px;
          background: rgba(15, 118, 110, 0.2);
          border: 1px solid var(--st-emerald, #0f766e);
          color: #2dd4bf;
          cursor: pointer;
          font-weight: 500;
        }

        .ss-btn-del {
          background: none;
          border: none;
          color: #f87171;
          font-size: 0.75rem;
          cursor: pointer;
        }

        /* TEMPLATE SELECTOR UI STYLES */
        .ss-template-selector-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(15, 23, 42, 0.65);
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid var(--contour, rgba(255, 255, 255, 0.12));
          backdrop-filter: blur(8px);
          gap: 1rem;
          flex-wrap: wrap;
        }

        .ss-template-bar-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--chalk-dim, #9aa1c4);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .ss-template-btn-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .ss-template-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid var(--contour, rgba(255, 255, 255, 0.15));
          background: rgba(255, 255, 255, 0.05);
          color: var(--chalk-dim, #9aa1c4);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ss-template-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .ss-template-btn.active {
          background: var(--st-emerald, #0f766e);
          border-color: var(--st-emerald, #0f766e);
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(15, 118, 110, 0.4);
        }

        .ss-template-cards-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ss-template-card {
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid var(--contour, rgba(255, 255, 255, 0.15));
          background: rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ss-template-card:hover {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.06);
        }

        .ss-template-card.is-selected {
          border-color: var(--st-emerald, #0f766e);
          background: rgba(15, 118, 110, 0.15);
          box-shadow: 0 0 12px rgba(15, 118, 110, 0.25);
        }

        .ss-template-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .ss-template-card-icon {
          font-size: 1.1rem;
        }

        .ss-template-card-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--chalk, #fff);
        }

        .ss-template-badge {
          margin-left: auto;
          font-size: 0.7rem;
          font-weight: 600;
          background: var(--st-emerald, #0f766e);
          color: #fff;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .ss-template-card-desc {
          margin: 0;
          font-size: 0.78rem;
          color: var(--chalk-dim, #9aa1c4);
          line-height: 1.35;
        }

        .ss-btn-secondary {
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid var(--contour, rgba(255, 255, 255, 0.2));
          background: var(--ridge, rgba(255, 255, 255, 0.08));
          color: var(--chalk, #fff);
          font-size: 0.85rem;
          cursor: pointer;
          font-weight: 500;
        }

        .ss-resume-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #7c6cf6, #a78bfa);
          color: #fff;
          font-size: 0.85rem;
          cursor: pointer;
          font-weight: 600;
        }

        /* -------------------------------------------------------------
           LIVE RESUME PAPER PREVIEW BASE STYLES
        ------------------------------------------------------------- */
        .ss-resume-preview-container {
          background: #334155;
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          justify-content: center;
          overflow-x: auto;
        }

        .ss-resume-paper {
          width: 100%;
          max-width: 800px;
          min-height: 1050px;
          background: #ffffff;
          color: #0f172a;
          padding: 2.5rem 2.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          border-radius: 4px;
          box-sizing: border-box;
          line-height: 1.45;
          transition: all 0.3s ease;
        }

        /* Base Section Styles */
        .resume-section {
          margin-bottom: 1.2rem;
        }

        .resume-summary-text {
          margin: 0;
          font-size: 0.85rem;
          color: #334155;
        }

        .resume-skills-grid {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.82rem;
        }

        .resume-skill-row strong {
          color: #1e293b;
        }

        .resume-skill-row span {
          color: #334155;
        }

        .resume-item {
          margin-bottom: 0.75rem;
        }

        .resume-item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .resume-item-date {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 500;
        }

        .resume-item-details {
          margin: 4px 0 0 0;
          font-size: 0.82rem;
          font-family: inherit;
          white-space: pre-wrap;
          color: #334155;
          line-height: 1.45;
        }

        .resume-item-desc {
          margin: 3px 0 0 0;
          font-size: 0.82rem;
          color: #334155;
        }

        .resume-certs-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .resume-cert-item {
          font-size: 0.82rem;
          color: #1e293b;
        }

        /* -------------------------------------------------------------
           TEMPLATE 1: MODERN TEMPLATE (.template-modern)
        ------------------------------------------------------------- */
        .ss-resume-paper.template-modern {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .ss-resume-paper.template-modern .resume-header {
          border-left: 5px solid var(--accent, #0f766e);
          padding-left: 1.25rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 1rem;
          margin-bottom: 1.25rem;
        }

        .ss-resume-paper.template-modern .resume-name {
          margin: 0;
          font-size: 2.1rem;
          font-weight: 800;
          color: var(--accent, #0f766e);
          letter-spacing: -0.02em;
        }

        .ss-resume-paper.template-modern .resume-title {
          font-size: 0.95rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #475569;
          margin-top: 4px;
        }

        .ss-resume-paper.template-modern .resume-contact-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
          font-size: 0.78rem;
          color: #475569;
          margin-top: 10px;
        }

        .ss-resume-paper.template-modern .resume-contact-bar span {
          background: rgba(15, 118, 110, 0.08);
          padding: 3px 8px;
          border-radius: 4px;
          color: #334155;
          font-weight: 500;
        }

        .ss-resume-paper.template-modern .resume-section-title {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--accent, #0f766e);
          border-bottom: 2px solid var(--accent, #0f766e);
          padding-bottom: 4px;
          margin-top: 0;
          margin-bottom: 0.6rem;
        }

        .ss-resume-paper.template-modern .resume-item-bold {
          font-weight: 700;
          font-size: 0.88rem;
          color: #0f172a;
        }

        .ss-resume-paper.template-modern .resume-item-sub {
          font-weight: 500;
          font-size: 0.85rem;
          color: #475569;
        }

        .ss-resume-paper.template-modern .resume-tech-badge {
          font-size: 0.78rem;
          color: var(--accent, #0f766e);
          font-weight: 600;
        }

        /* -------------------------------------------------------------
           TEMPLATE 2: CLASSIC TEMPLATE (.template-classic)
        ------------------------------------------------------------- */
        .ss-resume-paper.template-classic {
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.5;
        }

        .ss-resume-paper.template-classic .resume-header {
          text-align: center;
          border-bottom: 3px double var(--accent, #0f766e);
          padding-bottom: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .ss-resume-paper.template-classic .resume-name {
          margin: 0;
          font-size: 2.2rem;
          font-weight: 700;
          font-family: 'Georgia', serif;
          color: #0f172a;
          letter-spacing: 0.02em;
        }

        .ss-resume-paper.template-classic .resume-title {
          font-size: 0.98rem;
          font-style: italic;
          color: var(--accent, #0f766e);
          letter-spacing: 0.05em;
          margin-top: 4px;
        }

        .ss-resume-paper.template-classic .resume-contact-bar {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 14px;
          font-size: 0.8rem;
          color: #475569;
          margin-top: 10px;
        }

        .ss-resume-paper.template-classic .resume-section-title {
          font-family: 'Georgia', serif;
          font-size: 0.92rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          text-align: center;
          color: #0f172a;
          border-bottom: 1px solid var(--accent, #0f766e);
          padding-bottom: 4px;
          margin-top: 0;
          margin-bottom: 0.75rem;
        }

        .ss-resume-paper.template-classic .resume-item-bold {
          font-family: 'Georgia', serif;
          font-weight: 700;
          font-size: 0.92rem;
          color: #0f172a;
        }

        .ss-resume-paper.template-classic .resume-item-sub {
          font-style: italic;
          font-size: 0.88rem;
          color: #475569;
        }

        .ss-resume-paper.template-classic .resume-tech-badge {
          font-size: 0.8rem;
          font-style: italic;
          color: var(--accent, #0f766e);
        }

        /* -------------------------------------------------------------
           TEMPLATE 3: MINIMAL TEMPLATE (.template-minimal)
        ------------------------------------------------------------- */
        .ss-resume-paper.template-minimal {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          padding: 2.25rem 2.5rem;
        }

        .ss-resume-paper.template-minimal .resume-header {
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 0.85rem;
          margin-bottom: 1.15rem;
        }

        .ss-resume-paper.template-minimal .resume-name {
          margin: 0;
          font-size: 2.2rem;
          font-weight: 300;
          color: #0f172a;
          letter-spacing: -0.03em;
        }

        .ss-resume-paper.template-minimal .resume-title {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--accent, #0f766e);
          margin-top: 2px;
        }

        .ss-resume-paper.template-minimal .resume-contact-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 0.76rem;
          color: #64748b;
          margin-top: 8px;
        }

        .ss-resume-paper.template-minimal .resume-section-title {
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #475569;
          border-bottom: none;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 0;
          margin-bottom: 0.5rem;
        }

        .ss-resume-paper.template-minimal .resume-section-title::before {
          content: "";
          display: inline-block;
          width: 6px;
          height: 6px;
          background: var(--accent, #0f766e);
          border-radius: 50%;
        }

        .ss-resume-paper.template-minimal .resume-item-bold {
          font-weight: 600;
          font-size: 0.86rem;
          color: #0f172a;
        }

        .ss-resume-paper.template-minimal .resume-item-sub {
          font-weight: 400;
          font-size: 0.84rem;
          color: #64748b;
        }

        .ss-resume-paper.template-minimal .resume-tech-badge {
          font-size: 0.76rem;
          color: var(--accent, #0f766e);
          font-weight: 500;
        }

        /* -------------------------------------------------------------
           PRINT OVERRIDES (@media print)
        ------------------------------------------------------------- */
        @media print {
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
          }

          .no-print,
          .ss-sidebar,
          .ss-scrim,
          .ss-notif-dropdown,
          .ss-notif-scrim,
          .ss-ai-widget,
          .ss-template-selector-bar {
            display: none !important;
          }

          .ss-shell {
            display: block !important;
            min-height: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .ss-content {
            margin-left: 0 !important;
            padding: 0 !important;
          }

          .ss-resume-container {
            max-width: 100% !important;
            padding: 0 !important;
          }

          .ss-resume-workspace {
            display: block !important;
          }

          .ss-resume-preview-container {
            background: transparent !important;
            padding: 0 !important;
          }

          .ss-resume-paper {
            box-shadow: none !important;
            max-width: 100% !important;
            padding: 0 !important;
            min-height: auto !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .resume-section {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </AppLayout>
  );
}
