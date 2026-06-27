import { NavLink } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const Sidebar = () => {
  return (
    <nav
      className="
        fixed
        bottom-5 left-0
        w-full h-16 z-10
        border-t bg-white
        flex flex-row items-center justify-start
        px-4

        md:top-0 md:bottom-auto md:relative
        md:w-20 md:h-screen
        md:border-r md:border-t-0
        md:flex-col md:justify-start md:py-4
      "
    >
      <NavLink
        to="/messages"
        className={({ isActive }) =>
          `
          flex items-center justify-center
          h-12 w-12 rounded-lg
          transition-colors
          ${
            isActive
              ? "bg-blue-500 text-white"
              : "text-gray-500 hover:bg-gray-100"
          }
          `
        }
      >
        <MessageCircle size={24} />
        
      </NavLink>
     
    </nav>
  );
};

export default Sidebar;