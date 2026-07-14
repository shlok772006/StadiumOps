import { useState, useEffect, createContext, useContext } from "react";
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
      try { setUser(JSON.parse(saved)); } catch {}
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
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Topbar />
          <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
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
