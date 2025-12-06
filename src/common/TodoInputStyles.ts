// --------------------------------------------------
//                   Responsive Input Styles
// --------------------------------------------------

export const styles = {
  countBox: {
    display: "flex",
    gap: "16px",
    marginBottom: "12px",
    fontSize: "16px",
    fontWeight: 500,
    flexWrap: "wrap",

    // Small devices
    '@media (max-width: 480px)': {
      fontSize: "14px",
      gap: "10px",
    },

    // Tablets
    '@media (max-width: 768px)': {
      fontSize: "15px",
    },
  },

  row: {
    display: "flex",
    gap: "10px",
    marginBottom: "16px",
    width: "100%",

    // Stack layout vertically on mobile
    '@media (max-width: 480px)': {
      flexDirection: "column",
      gap: "8px",
    },
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
    outline: "none",
    width: "100%",

    '@media (max-width: 480px)': {
      fontSize: "14px",
      padding: "8px",
    },

    '@media (max-width: 768px)': {
      fontSize: "15px",
    },
  },

  btn: {
    padding: "10px 16px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#1976d2",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    minWidth: "100px",
    transition: "0.2s ease",

    '@media (max-width: 480px)': {
      width: "100%",
      fontSize: "14px",
      padding: "10px",
      minWidth: "100%",
    },

    '@media (max-width: 768px)': {
      fontSize: "15px",
    },
  },
} as const;
