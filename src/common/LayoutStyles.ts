/* ----------------------- Layout Styles ----------------------- */

import type { CSSProperties } from "react";

export const layoutStyles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f0f2f5",
    margin: "0 auto",
    padding: "0 16px", // mobile padding
  } as CSSProperties,

  header: {
    padding: "16px 24px",
    background: "#1976d2",
    color: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    fontSize: "20px",
    fontWeight: 600,
  } as CSSProperties,

  main: {
    flex: 1,
    padding: "24px",
    width: "100%",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
    margin: "24px auto",
    maxWidth: "650px", // good for all devices

    // ---- RESPONSIVE ---- //
    // mobile
    '@media (max-width: 480px)': {
      padding: "16px",
      margin: "16px 0",
    },

    // tablet
    '@media (max-width: 768px)': {
      padding: "20px",
      maxWidth: "90%",
    },

    // desktop wide
    '@media (min-width: 1200px)': {
      maxWidth: "750px",
    },
  } as CSSProperties,

  footer: {
    padding: "12px",
    textAlign: "center",
    background: "#fafafa",
    fontSize: "14px",
    color: "#555",
    borderTop: "1px solid #e1e1e1",
    marginTop: "auto",
  } as CSSProperties,
};
