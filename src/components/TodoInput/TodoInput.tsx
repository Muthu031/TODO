import { useState, useCallback } from "react";
import { useToast } from "../Notifications/ToastMsg";
import { Box } from "@mui/material";
import { styles } from "../../common/TodoInputStyles";

type TodoInputProps = {
  onAdd: (text: string) => void;
  totalCount: number;
  doneCount: number;
  pendingCount: number;
};

export default function TodoInput({
  onAdd,
  totalCount,
  doneCount,
  pendingCount,
}: TodoInputProps) {
  const [value, setValue] = useState("");
  const { showToast } = useToast();

  const handleAdd = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      showToast("Please enter a task", "error");
      return;
    }

    onAdd(trimmed);
    showToast(`Todo "${trimmed}" added successfully!`, "success");
    setValue("");
  }, [value, onAdd, showToast]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <Box>

      <Box sx={styles.countBox}>
        <span>Total: <strong>{totalCount}</strong></span>
        <span>Completed: <strong>{doneCount}</strong></span>
        <span>Pending: <strong>{pendingCount}</strong></span>
      </Box>

      <div style={styles.row}>
        <input
          style={styles.input}
          value={value}
          placeholder="Enter your task..."
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button style={styles.btn} onClick={handleAdd}>
          Add
        </button>
      </div>
    </Box>
  );
}
