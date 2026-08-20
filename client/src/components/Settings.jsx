import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import api from "../api/client";
import AppLayout from "./AppLayout";
import "./Dashboard.css";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`ss-toggle ${checked ? "is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="ss-toggle-knob" />
    </button>
  );
}

function SettingsRow({ title, desc, control }) {
  return (
    <div className="ss-settings-row">
      <div>
        <p className="ss-settings-row-title">{title}</p>
        {desc && <p className="ss-settings-row-desc">{desc}</p>}
      </div>
      {control}
    </div>
  );
}

export default function Settings() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [themePref, setThemePref] = useState("dark");

  const [emailDigest, setEmailDigest] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [liveSessionAlerts, setLiveSessionAlerts] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [language, setLanguage] = useState("English");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = async () => {
    try {
      const user = await api.get("/account/me");
      if (user) {
        if (user.themePreference) {
          setThemePref(user.themePreference);
          setTheme(user.themePreference);
        }
        if (user.emailNotifications !== undefined && user.emailNotifications !== null) {
          setEmailNotifications(user.emailNotifications);
        }
      }
    } catch (err) {
      console.error("Failed to load user settings:", err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/account/update", {
        themePreference: themePref,
        emailNotifications: emailNotifications,
      });
      setTheme(themePref);
      setSaved(true);
      showToast?.("Settings saved to your profile!", "success");
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      showToast?.(err.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="ss-dashboard">
        <h1 className="ss-welcome" style={{ marginBottom: "0.4rem" }}>Settings</h1>
        <p style={{ color: "var(--st-text-muted)", marginBottom: "1.75rem", fontSize: "14px" }}>
          Tune how Enterprise Learning talks to you and store your preferences on your profile.
        </p>

        <section className="ss-section">
          <h2 className="ss-section-title">Notifications</h2>
          <div className="ss-settings-card">
            <SettingsRow
              title="Email Notifications"
              desc="Receive course completion certificates, password resets, and 3-day inactivity study reminders."
              control={<Toggle checked={emailNotifications} onChange={setEmailNotifications} />}
            />
            <SettingsRow
              title="Weekly progress digest"
              desc="A Monday email summarizing your streak, hours, and what's next."
              control={<Toggle checked={emailDigest} onChange={setEmailDigest} />}
            />
            <SettingsRow
              title="Live session alerts"
              desc="Notify me 15 minutes before a scheduled live session."
              control={<Toggle checked={liveSessionAlerts} onChange={setLiveSessionAlerts} />}
            />
          </div>
        </section>

        <section className="ss-section">
          <h2 className="ss-section-title">Appearance</h2>
          <div className="ss-settings-card">
            <SettingsRow
              title="Theme Preference"
              desc="Stored on your user entity and persisted across browser sessions."
              control={
                <div className="ss-theme-switch">
                  <button
                    className={`ss-theme-btn ${themePref === "dark" ? "is-active" : ""}`}
                    onClick={() => {
                      setThemePref("dark");
                      setTheme("dark");
                    }}
                  >
                    Dark
                  </button>
                  <button
                    className={`ss-theme-btn ${themePref === "light" ? "is-active" : ""}`}
                    onClick={() => {
                      setThemePref("light");
                      setTheme("light");
                    }}
                  >
                    Light
                  </button>
                </div>
              }
            />
          </div>
        </section>

        <section className="ss-section">
          <h2 className="ss-section-title">Privacy & Learning</h2>
          <div className="ss-settings-card">
            <SettingsRow
              title="Public profile"
              desc="Let other learners see your badges and completed routes."
              control={<Toggle checked={publicProfile} onChange={setPublicProfile} />}
            />
            <SettingsRow
              title="Autoplay next lesson"
              desc="Automatically start the next unit when one finishes."
              control={<Toggle checked={autoplay} onChange={setAutoplay} />}
            />
            <SettingsRow
              title="Language"
              desc="Interface language for menus and prompts."
              control={
                <select className="ss-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Telugu</option>
                  <option>Spanish</option>
                </select>
              }
            />
          </div>
        </section>

        <section className="ss-section">
          <h2 className="ss-section-title">Account</h2>
          <div className="ss-settings-card">
            <SettingsRow
              title="Sign out of Enterprise Learning"
              desc="You'll need to sign back in to continue any route."
              control={
                <button className="ss-danger-btn" onClick={logout}>
                  Sign out
                </button>
              }
            />
          </div>
        </section>

        <button className="ss-resume-btn" onClick={handleSave} disabled={saving} style={{ padding: "10px 22px" }}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>

      <style>
        {`
          .ss-settings-card { background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 18px; padding: 6px 22px; backdrop-filter: blur(20px) saturate(140%); box-shadow: 0 8px 30px rgba(6, 8, 30, 0.4), inset 0 1px 0 rgba(255,255,255,0.06); }
          .ss-settings-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 16px 0; border-bottom: 1px solid var(--st-border); }
          .ss-settings-row:last-child { border-bottom: none; }
          .ss-settings-row-title { font-size: 14px; color: var(--st-cream); font-weight: 600; }
          .ss-settings-row-desc { font-size: 12px; color: var(--st-text-muted); margin-top: 3px; max-width: 46ch; }
          .ss-toggle { width: 42px; height: 24px; border-radius: 999px; border: none; background: var(--st-track); position: relative; flex-shrink: 0; transition: background 0.2s ease; cursor: pointer; }
          .ss-toggle.is-on { background: linear-gradient(135deg, #7C6CF6, #22D3EE); }
          .ss-toggle-knob { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform 0.2s ease; }
          .ss-toggle.is-on .ss-toggle-knob { transform: translateX(18px); }
          .ss-select { background: rgba(255,255,255,0.06); border: 1px solid var(--st-border); color: var(--st-cream); border-radius: 10px; padding: 8px 12px; font-size: 13px; font-family: var(--font-body); }
          .ss-theme-switch { display: flex; gap: 4px; background: var(--st-track); border-radius: 999px; padding: 3px; }
          .ss-theme-btn { border: none; background: transparent; color: var(--st-text-muted); font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 999px; transition: all 0.18s ease; cursor: pointer; }
          .ss-theme-btn.is-active { color: #fff; background: linear-gradient(135deg, #7C6CF6, #22D3EE); }
          .ss-danger-btn { background: transparent; border: 1px solid rgba(248, 113, 113, 0.5); color: #fca5a5; border-radius: 999px; padding: 8px 16px; font-size: 12px; font-weight: 600; transition: all 0.2s ease; cursor: pointer; }
          .ss-danger-btn:hover { background: rgba(248, 113, 113, 0.12); }
        `}
      </style>
    </AppLayout>
  );
}
