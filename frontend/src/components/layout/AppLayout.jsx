import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import Backdrop from '../common/Backdrop';

const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 xl:flex">
      <div className="screen-only">
        <AppSidebar />
        <Backdrop />
      </div>

      <div
        className={`flex-1 overflow-x-hidden transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
        } ${isMobileOpen ? 'ml-0' : ''}`}
      >
        <div className="screen-only">
          <AppHeader />
        </div>
        <main className="p-4 mx-auto max-w-screen-2xl md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppLayout = () => {
  return (
    <SidebarProvider>
      <Toaster 
        position="top-right"
        reverseOrder={false}
      />
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;