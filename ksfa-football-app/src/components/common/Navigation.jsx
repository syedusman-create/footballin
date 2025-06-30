// src/components/common/Navigation.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, Globe } from "lucide-react";
import logo from "/logo.png"; // Update path if needed
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';

const NAV_ITEMS = [
  { name: "Home", url: "/", icon: Home },
  { name: "Tournaments", url: "#", icon: Globe, isDropdown: true },
  { name: "Fixtures", url: "/fixtures", icon: Calendar },
];

const STATE_PAGES = [
  { id: "karnataka", name: "Karnataka League" },
  { id: "kerala", name: "Kerala League" },
  { id: "delhi", name: "Delhi League" },
];

const Navigation = ({
  selectedState,
  onStateSelect,
  user,
  isAdmin
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].name);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Determine active tab based on current path
    if (location.pathname === "/") {
      setActiveTab("Home");
    } else if (location.pathname.startsWith("/fixtures")) {
      setActiveTab("Fixtures");
    } else if (
      STATE_PAGES.some(
        (state) =>
          location.pathname.toLowerCase().includes(state.id)
      )
    ) {
      setActiveTab("Tournaments");
    } else {
      setActiveTab(""); // fallback
    }
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <>
      {/* Logo at the top left corner, separate from nav bar */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-50"
        style={{ display: "flex", alignItems: "center" }}
      >
        <img
          src={logo}
          alt="Logo"
          className="w-12 h-12 object-contain"
          style={{ background: "transparent" }}
        />
      </Link>

      {/* Floating nav bar, centered, only as wide as its content */}
      <div className="fixed bottom-8 sm:top-8 left-1/2 -translate-x-1/2 z-50 w-auto pointer-events-none">
        <div className="flex items-center gap-3 bg-green-900/80 border border-green-700 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg pointer-events-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;

            if (item.isDropdown) {
              return (
                <div
                  key={item.name}
                  className="relative"
                  ref={dropdownRef}
                >
                  <button
                    className={`relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors
                      text-green-200 hover:text-green-400 ${isActive ? "bg-green-800 text-green-300" : ""}`}
                    onClick={() => setShowDropdown((prev) => !prev)}
                    type="button"
                  >
                    <span className="hidden md:inline">{item.name}</span>
                    <span className="md:hidden">
                      <Icon size={18} strokeWidth={2.5} />
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="lamp"
                        className="absolute inset-0 w-full bg-green-700/10 rounded-full -z-10"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-400 rounded-t-full">
                          <div className="absolute w-12 h-6 bg-green-400/20 rounded-full blur-md -top-2 -left-2" />
                          <div className="absolute w-8 h-6 bg-green-400/20 rounded-full blur-md -top-1" />
                          <div className="absolute w-4 h-4 bg-green-400/20 rounded-full blur-sm top-0 left-2" />
                        </div>
                      </motion.div>
                    )}
                  </button>
                  {showDropdown && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 rounded-md shadow-lg bg-green-900 border border-green-700 z-50">
                      {STATE_PAGES.map((state) => (
                        <button
                          key={state.id}
                          onClick={() => {
                            onStateSelect(state.id);
                            setShowDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-green-200 hover:bg-green-700 hover:text-white rounded-none"
                          style={{
                            borderRadius: 0,
                            borderBottom: "1px solid #14532d",
                            background: "transparent"
                          }}
                        >
                          {state.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.url}
                className={`relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors
                  text-green-200 hover:text-green-400 ${isActive ? "bg-green-800 text-green-300" : ""}`}
              >
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden">
                  <Icon size={18} strokeWidth={2.5} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className="absolute inset-0 w-full bg-green-700/10 rounded-full -z-10"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-400 rounded-t-full">
                      <div className="absolute w-12 h-6 bg-green-400/20 rounded-full blur-md -top-2 -left-2" />
                      <div className="absolute w-8 h-6 bg-green-400/20 rounded-full blur-md -top-1" />
                      <div className="absolute w-4 h-4 bg-green-400/20 rounded-full blur-sm top-0 left-2" />
                    </div>
                  </motion.div>
                )}
              </Link>
            );
          })}
          {/* Auth links */}
          {user ? (
            <button
              onClick={async () => {
                await signOut(auth);
                navigate("/signin");
              }}
              className="ml-2 px-4 py-2 bg-green-800 text-green-200 rounded-full hover:bg-green-700 font-semibold text-sm"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/signin"
              className={`ml-2 px-4 py-2 bg-green-800 text-green-200 rounded-full hover:bg-green-700 font-semibold text-sm${location.pathname === '/signin' ? ' bg-green-700' : ''}`}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navigation;

