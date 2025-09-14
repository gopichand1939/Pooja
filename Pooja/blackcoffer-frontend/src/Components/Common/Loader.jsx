
import React from "react";
import { ClipLoader } from "react-spinners"; 

export default function Loader({ size = 50, color = "#7C3AED", loading = true }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px",
      width: "100%",
      minHeight: "120px"
    }}>
      <ClipLoader size={size} color={color} loading={loading} />
    </div>
  );
}
