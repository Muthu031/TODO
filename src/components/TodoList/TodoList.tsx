import { Todo } from "../../App";
import { styles } from "../../common/TodoListStyles";
import { useToast } from "../Notifications/ToastMsg";
import { memo } from "react";

type TodoListProps = {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  return (
    <ul style={styles.list}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

// -----------------------
//   TodoItem Component
// -----------------------

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
};

const TodoItem = memo(({ todo, onToggle, onDelete }: TodoItemProps) => {
  const { showToast } = useToast();

  const createdDate = new Date(todo.id).toLocaleString();

  return (
    <li style={styles.item}>
    
      <button
        onClick={() => onToggle(todo.id)}
        style={{
          ...styles.toggleBtn,
          backgroundColor: todo.completed ? "#4caf50" : "#ccc",
        }}
      >
        {todo.completed ? "✓" : ""}
      </button>

 
      <span
        onClick={() => onToggle(todo.id)}
        style={{
          ...styles.text,
          textDecoration: todo.completed ? "line-through" : "none",
          color: todo.completed ? "#777" : "#000",
        }}
      >
        {todo.text}
        <span style={styles.createdText}>
          (Created: {createdDate})
        </span>
      </span>

  
      <button
        onClick={() => {
          onDelete(todo.id);
          showToast("Todo removed successfully!", "success");
        }}
        style={styles.deleteBtn}
      >
        X
      </button>
    </li>
  );
});



