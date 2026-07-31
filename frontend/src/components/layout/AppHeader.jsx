import { Link } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import UserDropdown from './UserDropdown';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const AppHeader = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex w-full border-gray-200 bg-white lg:border-b">
      <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
            <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 lg:h-11 lg:w-11"
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
            <span className="text-xl font-bold">KSOP-K</span>
          </Link>
          
        </div>

        <div className="relative flex items-center justify-end gap-4 px-5 py-4 lg:flex">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;