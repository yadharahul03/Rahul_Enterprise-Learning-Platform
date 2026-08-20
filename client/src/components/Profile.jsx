import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import AppLayout from "./AppLayout";
import "./Dashboard.css";

export default function Profile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Editable fields
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await api.get("/account/me");
      setProfile(data);
      setName(data.name || "");
      setPhoneNumber(data.phoneNumber || "");
      setDateOfBirth(data.dateOfBirth || "");
      setGender(data.gender || "");
      setLocation(data.location || "");
    } catch (err) {
      setError("Could not load your profile. Is the backend running?");
    }
  };

  useEffect(() => {
    if (token) loadProfile();
  }, [token]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage("");
    try {
      const data = await api.put("/account/update", {
        name,
        phoneNumber,
        dateOfBirth: dateOfBirth || null,
        gender,
        location,
      });
      setProfile(data);
      setSaveMessage("Profile updated.");
    } catch (err) {
      setSaveMessage(err.message || "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      const data = await api.post("/account/change-password", { currentPassword, newPassword });
      setPasswordMessage(typeof data === "string" ? data : (data.message || "Password changed successfully"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || "Could not change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <div className="ss-dashboard">{error}</div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="ss-dashboard">Loading your profile...</div>
      </AppLayout>
    );
  }

  const initials = (profile.name || "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AppLayout>
      <div className="ss-dashboard" style={{ maxWidth: "700px" }}>
        {/* Header */}
        <div className="ss-header">
          <div className="ss-header-left">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.name}
                style={{ width: 48, height: 48, borderRadius: "50%" }}
              />
            ) : (
              <div className="ss-avatar">{initials}</div>
            )}
            <div>
              <h1 className="ss-welcome">{profile.name}</h1>
              <p className="ss-streak">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="ss-stats-grid" style={{ marginBottom: "2rem" }}>
          <div className="ss-stat-card">
            <p className="ss-stat-value">{profile.coursesEnrolled}</p>
            <p className="ss-stat-label">Courses enrolled</p>
          </div>
          <div className="ss-stat-card">
            <p className="ss-stat-value">{profile.coursesCompleted}</p>
            <p className="ss-stat-label">Courses completed</p>
          </div>
          <div className="ss-stat-card">
            <p className="ss-stat-value" style={{ fontSize: "16px" }}>
              {profile.memberSince
                ? new Date(profile.memberSince).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                  })
                : "—"}
            </p>
            <p className="ss-stat-label">Member since</p>
          </div>
        </div>

        {/* Edit personal details */}
        <section className="ss-section">
          <h2 className="ss-section-title">Personal details</h2>
          <form onSubmit={handleSaveProfile} className="ss-skill-list" style={{ display: "block" }}>
            <label style={{ display: "block", fontSize: "12px", color: "var(--st-text-muted)", marginTop: "10px" }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />

            <label style={{ display: "block", fontSize: "12px", color: "var(--st-text-muted)", marginTop: "10px" }}>Phone number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={inputStyle}
            />

            <label style={{ display: "block", fontSize: "12px", color: "var(--st-text-muted)", marginTop: "10px" }}>Date of birth</label>
            <input
              type="date"
              value={dateOfBirth || ""}
              onChange={(e) => setDateOfBirth(e.target.value)}
              style={inputStyle}
            />

            <label style={{ display: "block", fontSize: "12px", color: "var(--st-text-muted)", marginTop: "10px" }}>Gender</label>
            <select value={gender || ""} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
              <option value="">Prefer not to say</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>

            <label style={{ display: "block", fontSize: "12px", color: "var(--st-text-muted)", marginTop: "10px" }}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={inputStyle}
            />

            <button type="submit" className="ss-resume-btn" style={{ marginTop: "16px" }} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
            {saveMessage && <p style={{ marginTop: "8px", fontSize: "13px", color: "var(--st-sage)" }}>{saveMessage}</p>}
          </form>
        </section>

        {/* Change password */}
        <section className="ss-section">
          <h2 className="ss-section-title">Password</h2>
          {profile.isGoogleAccount ? (
            <p style={{ color: "var(--st-text-muted)", fontSize: "13px" }}>
              This account uses Google sign-in, so there's no password to change here.
            </p>
          ) : (
            <form onSubmit={handleChangePassword} className="ss-skill-list" style={{ display: "block" }}>
              {passwordError && (
                <p style={{ color: "var(--st-orange-light)", fontSize: "13px", marginBottom: "8px" }}>{passwordError}</p>
              )}
              {passwordMessage && (
                <p style={{ color: "var(--st-sage)", fontSize: "13px", marginBottom: "8px" }}>{passwordMessage}</p>
              )}

              <label style={{ display: "block", fontSize: "12px", color: "var(--st-text-muted)" }}>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={inputStyle}
                required
              />

              <label style={{ display: "block", fontSize: "12px", color: "var(--st-text-muted)", marginTop: "10px" }}>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
                required
                minLength={6}
              />

              <label style={{ display: "block", fontSize: "12px", color: "var(--st-text-muted)", marginTop: "10px" }}>Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
                required
                minLength={6}
              />

              <button type="submit" className="ss-resume-btn" style={{ marginTop: "16px" }} disabled={changingPassword}>
                {changingPassword ? "Changing..." : "Change password"}
              </button>
            </form>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

const inputStyle = {
  width: "100%",
  background: "var(--st-forest-deep)",
  border: "1px solid var(--st-border)",
  borderRadius: "6px",
  color: "var(--st-cream)",
  padding: "8px 10px",
  fontSize: "13px",
  marginTop: "4px",
};
