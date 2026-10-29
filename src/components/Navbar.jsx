
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const navigationItems = [
  { label: "Dashboard", path: "/" },
  { label: "Tournaments", path: "/tournaments" },
  { label: "Teams", path: "/teams" },
  { label: "Players", path: "/players" },
  { label: "Matches", path: "/matches" },
  { label: "Results", path: "/results" },
];

function Navbar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">ST</div>

        <div className="brand-text">
          <h2>Sports Portal</h2>
          <p>Tournament Management</p>
        </div>
      </div>

      <div className="sidebar-section-title">MAIN MENU</div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Sports Tournament Portal</p>
        <p>Management System</p>
      </div>
    </aside>
  );
}

export default Navbar;
