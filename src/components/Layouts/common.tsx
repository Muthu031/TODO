import { layoutStyles } from "../../common/LayoutStyles";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={layoutStyles.container}>
      <header style={layoutStyles.header}>Todo Application</header>

      <main style={layoutStyles.main}>{children}</main>

      <footer style={layoutStyles.footer}>© 2025 My App</footer>
    </div>
  );
}
