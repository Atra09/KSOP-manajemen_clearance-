import { Link } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useTheme } from '../../context/ThemeContext';
import UserDropdown from './UserDropdown';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const AppHeader = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex w-full border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 transition-colors lg:border-b">
      <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 px-3 py-3 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
            <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors lg:h-11 lg:w-11"
                onClick={handleToggle}
                aria-label="Toggle Sidebar"
                >
                {isMobileOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                ) : (
                    <Bars3Icon className="h-6 w-6" />
                )}
            </button>

          
          <Link to="/" className="lg:hidden">
            <span className="text-xl font-bold text-gray-800 dark:text-white">KSOP-K</span>
          </Link>
          
        </div>

        <div className="relative flex items-center justify-end gap-3 px-5 py-4 lg:flex">
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-indigo-400 transition-all shadow-sm"
            aria-label="Toggle Dark Mode"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5 text-amber-400 transform hover:rotate-45 transition-transform" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-600 hover:text-indigo-600 transform hover:-rotate-12 transition-transform" />
            )}
          </button>

          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;