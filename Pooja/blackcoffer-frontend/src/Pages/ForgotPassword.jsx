
// src/Pages/ForgotPassword.jsx
import React from "react";

const ForgotPassword = () => {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Forgot Password</h2>
      <p>Please enter your email address to reset your password.</p>
      <form style={{ marginTop: "20px" }}>
        <input
          type="email"
          placeholder="Enter your email"
          style={{ padding: "8px", width: "250px", marginBottom: "10px" }}
        />
        <br />
        <button
          type="submit"
          style={{ padding: "8px 16px", background: "#2563eb", color: "white", border: "none", cursor: "pointer" }}
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
