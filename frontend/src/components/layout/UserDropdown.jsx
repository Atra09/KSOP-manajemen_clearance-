import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
      });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return windowSize;
};

const UserMenuContent = ({ onClose, user }) => (
  <>
    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
      <span className="block font-semibold text-gray-800 dark:text-gray-100">{user.nama_lengkap}</span>
      <span className="block mt-0.5 text-sm text-gray-500 dark:text-gray-400">{user.username}</span>
    </div>
    <ul className="p-2 space-y-1">
      <li>
        <Link to="/profile" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors">
          Profil Saya
        </Link>
      </li>
      <li>
        <Link to="/settings" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors">
          Pengaturan
        </Link>
      </li>
    </ul>
    <div className="p-2 border-t border-gray-200 dark:border-gray-800">
      <button 
        onClick={() => { 
          localStorage.removeItem('token');
          window.location.href = '/signin';
          onClose(); 
        }} 
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
      >
        Keluar (Sign Out)
      </button>
    </div>
  </>
);

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width < 1024;
  const dropdownRef = useRef(null);

  const { user, loading } = useAuth(); 
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading || !user) {
    return (
        <div className="relative">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 px-4 py-2 shadow-sm">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="hidden h-5 w-20 rounded bg-gray-200 dark:bg-gray-800 animate-pulse sm:block" />
            </div>
        </div>
    );
  }

  const photoSrc = user.foto 
    ? `${API_URL}/${user.foto}` 
    : "/images/user/default.jpeg";

  return (
    <div ref={dropdownRef} className="relative">
      <button 
        onClick={() => setIsOpen((prev) => !prev)} 
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-800 shadow-sm hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
      >
        <img 
          src={photoSrc} 
          alt="User" 
          className="h-8 w-8 rounded-full object-cover" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/user/owner.jpeg";
          }}
        />
        <span className="hidden font-medium sm:block">{user.nama_lengkap?.split(' ')[0]}</span>
        <svg 
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
          width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M4.3125 8.65625L9 13.3437L13.6875 8.65625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          isMobile ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60"
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-0 w-full rounded-t-2xl bg-white dark:bg-gray-900 dark:border-t dark:border-gray-800"
              >
                <div className="mx-auto my-3 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
                <UserMenuContent onClose={() => setIsOpen(false)} user={user} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute top-full right-0 mt-2 z-50 w-[260px] origin-top-right rounded-2xl border border-gray-200 bg-white shadow-lg dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-950/50"
            >
              <UserMenuContent onClose={() => setIsOpen(false)} user={user} />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}