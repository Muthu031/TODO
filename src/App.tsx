import { useState, useMemo } from "react";
import TodoInput from "./components/TodoInput/TodoInput";
import TodoList from "./components/TodoList/TodoList";
import Layout from "./components/Layouts/common";
import { ToastProvider } from "./components/Notifications/ToastMsg";

export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    setTodos((prev) => [...prev, { id: Date.now(), text, completed: false }]);
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // ----------------------
  // Counts (auto-updated)
  // ----------------------
  const totalCount = todos.length;
  const doneCount = useMemo(
    () => todos.filter((t) => t.completed).length,
    [todos]
  );
  const pendingCount = totalCount - doneCount;

  return (
    <div style={{ padding: "20px" }}>
      <Layout>
        <ToastProvider>

          <TodoInput
            onAdd={addTodo}
            totalCount={totalCount}
            doneCount={doneCount}
            pendingCount={pendingCount}
          />

          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />

        </ToastProvider>
      </Layout>
    </div>
  );
}
