"use client";

import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import {Navbar} from "@/_components/Navbar";
import { useAuth } from "@/_context/AuthContext";
import { useRouter } from "next/navigation";

const SETTING_TABS = [
  { id: "konto",         icon: "👤", label: "Account"              },
  { id: "haslo",         icon: "🔒", label: "Password & Security" },
  { id: "usuniecie",     icon: "⚠️", label: "Delete Account"         },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button className={`settings-toggle ${on ? "on" : ""}`} onClick={onChange}>
      <span className="settings-toggle-thumb" />
    </button>
  );
}

function SettingsRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="settings-row">
      <div className="settings-row-label-wrap">
        <span className="settings-row-label">{label}</span>
        {sub && <span className="settings-row-sub">{sub}</span>}
      </div>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState("konto");
  const [passwdChanged, setPasswdChanged] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle]           = useState("");
  const [email, setEmail]             = useState("");
  const [bio, setBio]                 = useState("");
  const [booksGoal, setBooksGoal]         = useState(0);
  const [savedKonto, setSavedKonto]   = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConformation, setDeleteConformation] = useState("");

  const [fetchError, setFetchError]   = useState("");
  const [passwdError, setPasswdError]     = useState("");
  const [deleteError, setDeleteError] = useState("");


  const [currPass, setCurrPass]   = useState("");
  const [newPass, setNewPass]     = useState("");
  const [confPass, setConfPass]   = useState("");
  const [showP, setShowP]         = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || ""); 
      setHandle(user.username || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setBooksGoal(user.books_Goal || 0);
    }
  }, [user]);
  
  if (authLoading || !user) {
    return (
      <><Navbar />
        <div className="inner-page books-loading">
          <div className="books-loading-spinner" />
          <p>Loading…</p>
        </div>
      </>
    );
  }

  const changeData = async() => {
    try{
      const res = await fetch("http://localhost:5000/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          email,
          bio,
          books_Goal: booksGoal
        }),
        credentials: "include"});
        if (!res.ok) {
          throw new Error("Failed to update account information.");
        }
        await refreshUser?.();
        setSavedKonto(true);
        setTimeout(() => setSavedKonto(false), 3000);
      } catch (err) {
        console.error(err);
        setFetchError("Failed to update account information.");
      }
  };

  const changePassword = async() => {
    if (newPass !== confPass) {
      setPasswdError("New password and confirmation do not match.");
      return;
    }
    const res =await fetch("http://localhost:5000/api/user/changePassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        currentPassword: currPass,
        newPassword: newPass
      }),
      credentials: "include"
    })
    if (!res.ok) {
      setPasswdError("Failed to change password. Please check your current password and try again.");
      return;
    }
    setPasswdError("");
    setCurrPass("");
    setNewPass("");
    setConfPass("");
    setPasswdChanged(true);
    setTimeout(() => setPasswdChanged(false), 3000);
  };

  const deleteAccount = async() => {
    const res = await fetch("http://localhost:5000/api/user/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: deletePassword,
        confirmation: deleteConformation
      }),
      credentials: "include"
    });
    if (!res.ok) {
      setDeleteError("Failed to delete account.");
      return;
    }
    await refreshUser?.();
    router.push("/");
    
  }


  const strength = (() => {
    if (!newPass) return 0;
    let s = 1;
    if (newPass.length >= 8) s++;
    if (/[A-Z]/.test(newPass)) s++;
    if (/[0-9]/.test(newPass)) s++;
    if (/[^A-Za-z0-9]/.test(newPass)) s++;
    return s;
  })();
  const strengthColor = ["", "#e05252", "#e09452", "#c9a84c", "#52b788"][strength];
  const strengthLabel = ["", "Weak", "Average", "Strong", "Very Strong"][strength];

  return (
    <>
      <Navbar />
      <div className="inner-page">

        <div className="page-header" style={{ marginBottom: 36 }}>
          <div>
            <div className="page-eyebrow"><span className="eyebrow-line" />Manage Account<span className="eyebrow-line" /></div>
            <h1 className="page-title">Settings</h1>
          </div>
        </div>

        <div className="settings-layout">

          {/* Sidebar */}
          <aside className="settings-sidebar">
            {SETTING_TABS.map(t => (
              <button
                key={t.id}
                className={`settings-nav-item ${tab === t.id ? "active" : ""} ${t.id === "usuniecie" ? "danger" : ""}`}
                onClick={() => setTab(t.id)}
              >
                <span className="settings-nav-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </aside>

          {/* Main content */}
          <div className="settings-main">

            {/* ── KONTO ── */}
            {tab === "konto" && (
              <div className="settings-panel">
                <h2 className="settings-panel-title">Account Information</h2>

                <div className="settings-avatar-row">
                  <div className="settings-avatar">{user?.name.split(" ").map(n => n.charAt(0).toUpperCase()).join("").slice(0, 2) || "U"}</div>
                </div>

                <div className="settings-fields-grid">
                  <div className="field active">
                    <label>Full Name</label>
                    <div className="input-wrap">
                      <input value={displayName} onChange={e => setDisplayName(e.target.value)} type="text" />
                    </div>
                  </div>
                  <div className="field">
                    <label>Username</label>
                    <div className="input-wrap">
                      <input value={handle} disabled type="text" placeholder="@handle" />
                      <span className="input-icon" style={{ right: 14, fontSize: 12 }}>@</span>
                    </div>
                  </div>
                  <div className="field" style={{ gridColumn: "1 / -1" }}>
                    <label>Email Address</label>
                    <div className="input-wrap">
                      <input value={email} disabled type="email" />
                      <span className="input-icon">✉</span>
                    </div>
                  </div>
                  <div className="field" style={{ gridColumn: "1 / -1" }}>
                    <label>Bio</label>
                    <textarea
                      className="contact-textarea"
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={3}
                      maxLength={160}
                    />
                    <p className="settings-hint" style={{ textAlign: "right" }}>{bio.length}/160</p>
                  </div>
                </div>

                <div className="settings-field-group">
                  <div className="settings-group-title">Reading Goal 2026</div>
                  <SettingsRow label="Number of books per year" sub="Used in statistics and on your profile">
                    <input type="number" className="settings-number-input" value={booksGoal} onChange={e => setBooksGoal(parseInt(e.target.value) || 0)} min={1} max={365} />
                  </SettingsRow>
                </div>

                {fetchError && <div className="settings-error-toast">{fetchError}</div>}
                <button className="btn-submit" style={{ marginTop: 24, maxWidth: 200 }} onClick={() => changeData()}>
                  Save Changes
                </button>
                {savedKonto && <div className="settings-saved-toast">✓ Changes saved</div>}
              </div>
            )}

            {/* ── HASŁO ── */}
            {tab === "haslo" && (
              <div className="settings-panel">
                <h2 className="settings-panel-title">Password & Security</h2>

                <div className="settings-field-group">
                  <div className="settings-group-title">Change Password</div>
                  <div className="field">
                    <label>Current Password</label>
                    <div className="input-wrap">
                      <input type={showP ? "text" : "password"} value={currPass} onChange={e => setCurrPass(e.target.value)} placeholder="••••••••" />
                      <span className="input-icon clickable" onClick={() => setShowP(v => !v)}>{showP ? "🙈" : "👁"}</span>
                    </div>
                  </div>
                  <div className="field">
                    <label>New Password</label>
                    <div className="input-wrap">
                      <input type={showP ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Minimum 8 characters" />
                    </div>
                    {newPass && (
                      <div className="strength-bar" style={{ marginTop: 8 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} className="strength-seg" style={{ background: i <= strength ? strengthColor : undefined }} />
                        ))}
                        <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                      </div>
                    )}
                  </div>
                  <div className="field">
                    <label>Confirm New Password</label>
                    <div className="input-wrap">
                      <input type={showP ? "text" : "password"} value={confPass} onChange={e => setConfPass(e.target.value)} placeholder="••••••••" />
                      {confPass && newPass && (
                        <span className="input-icon" style={{ color: confPass === newPass ? "#52b788" : "#e05252" }}>
                          {confPass === newPass ? "✓" : "✗"}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="btn-submit" style={{ maxWidth: 220 }} disabled={!currPass || !newPass || newPass !== confPass || strength < 2} onClick={changePassword}>
                    Change Password
                  </button>

                  {passwdError && <div className="settings-error-toast">{passwdError}</div>}
                  {passwdChanged && <div className="settings-saved-toast">✓ Password changed</div>}
                </div>
              </div>
            )}



            {/* ── USUŃ KONTO ── */}
            {tab === "usuniecie" && (
              <div className="settings-panel">
                <h2 className="settings-panel-title" style={{ color: "#e05252" }}>Delete Account</h2>
                <div className="danger-zone">
                  <div className="danger-warning">
                    <span className="danger-icon">⚠️</span>
                    <div>
                      <strong>This action is irreversible.</strong>
                      <p>Deleting your account will permanently remove all your data — your bookshelf, reviews, statistics, and reading history. This cannot be undone.</p>
                    </div>
                  </div>
                  <div className="settings-field-group" style={{ marginTop: 24 }}>
                    <div className="field">
                      <label>Enter your password to confirm</label>
                      <div className="input-wrap">
                        <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="••••••••" style={{ maxWidth: 320 }} />
                      </div>
                    </div>
                    <div className="field">
                      <label>Enter "DELETE ACCOUNT" to confirm</label>
                      <div className="input-wrap">
                        <input type="text" placeholder="DELETE ACCOUNT" value={deleteConformation} onChange={e => setDeleteConformation(e.target.value)} style={{ maxWidth: 320 }} />
                      </div>
                    </div>
                    <button className="btn-danger" disabled={deleteConformation !== "DELETE ACCOUNT"} style={{ marginTop: 8 }} onClick={deleteAccount}>
                      Permanently delete account
                    </button>
                  {deleteError && <div className="settings-error-toast">{deleteError}</div>}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
