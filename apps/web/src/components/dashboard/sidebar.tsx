import { NavLink } from "react-router-dom";
import { LogOut, MessageCircle, Moon, Settings, Sun } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useTheme } from "../../context/themeContext";

interface SidebarProps {
  inChat?: boolean;
}

const Sidebar = ({ inChat = false }: SidebarProps) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isStandalone = !user?.tenant_id;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] h-12 rounded-xl transition-colors ${
      isActive
        ? "text-[var(--accent)]"
        : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
    }`;

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-30
        flex flex-row items-center justify-around
        px-2 pt-1.5 mobile-tab-bar
        border-t border-[var(--border)]
        bg-[var(--surface)]
        shadow-[0_-1px_0_var(--border),0_-8px_24px_rgba(0,0,0,0.06)]

        md:relative md:z-auto md:bottom-auto md:left-auto md:right-auto
        md:w-16 md:h-full md:flex-col md:justify-start md:gap-1 md:py-4 md:px-0
        md:border-t-0 md:border-r md:shadow-none

        ${inChat ? "hidden md:flex" : "flex"}
      `}
    >
      <NavLink to="/dashboard" className={linkClass} title="Chats">
        <MessageCircle size={22} strokeWidth={1.75} />
        <span className="text-[10px] font-medium md:hidden">Chats</span>
      </NavLink>

      {isStandalone && (
        <NavLink to="/dashboard/settings" className={linkClass} title="Profile">
          <Settings size={20} strokeWidth={1.75} />
          <span className="text-[10px] font-medium md:hidden">Profile</span>
        </NavLink>
      )}

      <button
        type="button"
        onClick={toggleTheme}
        className="flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] h-12 rounded-xl text-[var(--fg-muted)] hover:text-[var(--fg)]"
        title={theme === "light" ? "Dark mode" : "Light mode"}
      >
        {theme === "light" ? <Moon size={20} strokeWidth={1.75} /> : <Sun size={20} strokeWidth={1.75} />}
        <span className="text-[10px] font-medium md:hidden">Theme</span>
      </button>

      <button
        type="button"
        onClick={logout}
        className="flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] h-12 rounded-xl text-[var(--fg-muted)] hover:text-[var(--fg)] md:mt-auto"
        title="Logout"
      >
        <LogOut size={20} strokeWidth={1.75} />
        <span className="text-[10px] font-medium md:hidden">Logout</span>
      </button>
    </nav>
  );
};

export default Sidebar;
