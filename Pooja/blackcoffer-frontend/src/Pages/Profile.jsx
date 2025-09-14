// src/Pages/Profile.jsx
import React, { useEffect, useState, useRef } from "react";
import "./../styles/profile.css";
import defaultProfile from "../assets/profile.png";

export default function ProfilePage() {
  const [user, setUser] = useState({
    username: "chandu",
    role: "admin",
    avatar: "", // will fallback to defaultProfile if empty
    bio: "Product Designer focused on clarity, usability and data-driven decisions.",
    location: "Mumbai, India",
    email: "chandu@gmail.com",
    joined: "2021-05-18",
    followers: 312,
    following: 48,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const fileInputRef = useRef(null);

  // load from localStorage and merge defaults
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bc_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser((u) => ({ ...u, ...parsed }));
      }
    } catch (e) {
      console.warn("Failed to parse bc_user", e);
    }
  }, []);

  // open edit modal with a draft copy
  const openEdit = () => {
    setDraft({ ...user });
    setIsEditing(true);
  };

  const closeEdit = () => {
    setIsEditing(false);
    setDraft(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // handle input changes on draft
  const onDraftChange = (key, val) => {
    setDraft((d) => ({ ...d, [key]: val }));
  };

  // handle avatar file input -> store base64 in draft.avatar
  const onAvatarChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // allow only images
    if (!f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((d) => ({ ...d, avatar: reader.result }));
    };
    reader.readAsDataURL(f);
  };

  // save draft to localStorage and update UI
  const saveDraft = () => {
    if (!draft) return;
    const toSave = { ...draft };
    // optionally strip big fields if needed
    localStorage.setItem("bc_user", JSON.stringify(toSave));
    setUser(toSave);
    closeEdit();
  };

  // helper to get avatar url: prefer user.avatar -> defaultProfile
  const avatarSrc = user.avatar && user.avatar.length ? user.avatar : defaultProfile;

  return (
    <div className="profile-page" role="main">
      <div className="profile-hero card">
        <div className="hero-left">
          <div className="avatar-wrap">
            {avatarSrc ? (
              <img src={avatarSrc} alt={`${user.username} avatar`} className="avatar-img" />
            ) : (
              <div className="avatar-fallback">
                {user.username ? user.username[0].toUpperCase() : "U"}
              </div>
            )}
          </div>
        </div>

        <div className="hero-main">
          <div className="hero-row">
            <div>
              <h1 className="profile-name">{user.username}</h1>
              <div className="profile-role">
                <span className="role-badge">Admin</span>
                <span className="role-sub">{user.role}</span>
              </div>
            </div>

            <div className="hero-actions">
              <button className="btn-outline" onClick={openEdit}>
                Configure
              </button>
              <button className="btn-primary">Follow +</button>
            </div>
          </div>

          <p className="profile-bio">{user.bio}</p>

          <div className="profile-meta">
            <div>
              <strong>Username:</strong> {user.username}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Location:</strong> {user.location}
            </div>
            <div>
              <strong>Member since:</strong> {user.joined}
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <div className="stat-num">{user.followers}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat">
              <div className="stat-num">{user.following}</div>
              <div className="stat-label">Following</div>
            </div>
            <div className="stat">
              <div className="stat-num">24</div>
              <div className="stat-label">Posts</div>
            </div>
            <div className="stat">
              <div className="stat-num">8</div>
              <div className="stat-label">Collections</div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <section className="card activity-card">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            <li>
              <div className="activity-title">Published analysis: "Energy markets Q2"</div>
              <div className="activity-meta muted">2 days ago • Report</div>
            </li>
            <li>
              <div className="activity-title">Shared: "Oil price history"</div>
              <div className="activity-meta muted">1 week ago • Link</div>
            </li>
            <li>
              <div className="activity-title">Commented on trend "Electric vehicles"</div>
              <div className="activity-meta muted">3 weeks ago • Discussion</div>
            </li>
          </ul>
        </section>

        <section className="card stats-card">
          <h3>Project highlights</h3>
          <div className="stats-body">
            <div className="stat-row">
              <div className="small-pill">Data Explorer</div>
              <div className="muted">Lead designer</div>
            </div>
            <div className="stat-row">
              <div className="small-pill">Events Dashboard</div>
              <div className="muted">UI + interactions</div>
            </div>
            <div className="stat-row">
              <div className="small-pill">Insights generator</div>
              <div className="muted">Prototype & UX</div>
            </div>
          </div>
        </section>
      </div>

      {/* Edit modal */}
      {isEditing && draft && (
        <div className="modal-backdrop" onClick={closeEdit} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Edit profile</h3>

            <div className="form-row">
              <label>Avatar</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 72, height: 72 }}>
                  <img
                    src={draft.avatar && draft.avatar.length ? draft.avatar : defaultProfile}
                    alt="preview"
                    style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }}
                  />
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarChange} />
                  <div className="muted" style={{ fontSize: 12 }}>PNG / JPG recommended</div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <label>Username</label>
              <input value={draft.username} onChange={(e) => onDraftChange("username", e.target.value)} />
            </div>

            <div className="form-row">
              <label>Email</label>
              <input value={draft.email} onChange={(e) => onDraftChange("email", e.target.value)} />
            </div>

            <div className="form-row">
              <label>Location</label>
              <input value={draft.location} onChange={(e) => onDraftChange("location", e.target.value)} />
            </div>

            <div className="form-row">
              <label>Bio</label>
              <textarea value={draft.bio} onChange={(e) => onDraftChange("bio", e.target.value)} rows={3} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn-outline" onClick={closeEdit}>Cancel</button>
              <button className="btn-primary" onClick={saveDraft}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
