/**
 * components/Layout.js
 * Root layout component for the command center dashboard.
 * Provides AppContext with theme, language, notification, and user state.
 * Includes skip navigation link and accessible ARIA landmarks.
 */
import { useState, useEffect, createContext, useContext } from "react";
import PropTypes from "prop-types";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import NotificationFeed from "./NotificationFeed";

const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [highContrast, setHighContrast] = useState(false);
  const [language, setLanguage] = useState("English");
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("stadiumops_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (_e) { /* ignore malformed data */ }
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-contrast", highContrast ? "high" : "normal");
  }, [highContrast]);

  function addNotification(title, message, priority = "info") {
    const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setNotifications((prev) => [{ id, title, message, priority, timestamp: ts }, ...prev].slice(0, 50));

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 8000);
  }

  function removeNotification(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const ctx = {
    sidebarOpen, setSidebarOpen,
    theme, setTheme,
    highContrast, setHighContrast,
    language, setLanguage,
    notifications, addNotification, removeNotification,
    user, setUser,
  };

  return (
    <AppContext.Provider value={ctx}>
      {/* Skip navigation link for keyboard/screen reader users */}
      <a href="#main-content" className="sr-only" style={{ position: "absolute", top: 0, left: 0, zIndex: 9999, padding: "8px 16px", background: "var(--accent-blue)", color: "#fff", textDecoration: "none", fontWeight: 600 }}>
        Skip to main content
      </a>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Topbar />
          <main id="main-content" role="main" style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            {children}
          </main>
        </div>
        <NotificationFeed
          notifications={notifications}
          onDismiss={removeNotification}
        />
      </div>
    </AppContext.Provider>
  );
}

Layout.propTypes = {
  /** Page content to render in the main area */
  children: PropTypes.node.isRequired,
};
