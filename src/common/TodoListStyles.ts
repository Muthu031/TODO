// --------------------------------------------------
//               Responsive List Styles
// --------------------------------------------------

export const styles = {
  list: {
    padding: 0,
    listStyle: "none",
    marginTop: 20,
  },

  item: {
    display: "flex",
    alignItems: "center",
    padding: "10px 14px",
    background: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
    flexWrap: "wrap", // 👉 Makes layout responsive for small screens

    "@media (min-width: 600px)": {
      flexWrap: "nowrap", // 👉 Inline for tablet & above
    },
  },

  toggleBtn: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    color: "#fff",

    "@media (max-width: 600px)": {
      width: 30,
      height: 30, // 👉 Bigger for touch devices
    },
  },

  text: {
    fontSize: 16,
    flex: 1,
    cursor: "pointer",
    wordBreak: "break-word", // 👉 Long text wraps on mobile

    "@media (max-width: 600px)": {
      fontSize: 15,
    },
    "@media (min-width: 900px)": {
      fontSize: 17,
    },
  },

  createdText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#999",

    "@media (max-width: 600px)": {
      fontSize: 11,
      marginLeft: 0,
      display: "block", // 👉 Moves below title in mobile
    },
  },

  deleteBtn: {
    background: "#d32f2f",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 4,
    cursor: "pointer",
    transition: "0.2s ease",

    "@media (max-width: 600px)": {
      padding: "8px 12px", // 👉 Big enough for thumb press
      width: "100%",
    },

    "@media (min-width: 900px)": {
      padding: "6px 14px",
    },
  },
} as const;
