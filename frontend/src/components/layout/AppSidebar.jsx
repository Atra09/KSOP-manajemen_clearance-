import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import SidebarWidget from './SidebarWidget';
import {
  GridIcon,
  FileIcon,
  BoxCubeIcon,
  ChevronDownIcon,
  HorizontaLDots,
  ListIcon,
  UserCircleIcon,
} from '../../icons';

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const subMenuRefs = useRef({});
  
  const [openSubmenus, setOpenSubmenus] = useState([]);
  const [subMenuHeight, setSubMenuHeight] = useState({});

  const navItems = useMemo(() => [
    { id: 'dash', name: 'Dashboard', path: '/', icon: <GridIcon /> },
    { id: 'clearance', name: 'Clearance', path: '/clearance', icon: <FileIcon /> },
    {
      id: 'master',
      name: 'Data Master',
      icon: <BoxCubeIcon />,
      roles: ['user', 'koordinator', 'superuser'],
      subItems: [
        { name: 'Kapal', path: '/master/kapal' },
        { name: 'Nahkoda', path: '/master/nahkoda' },
        { name: 'Agen', path: '/master/agen' },
        { name: 'Daerah', path: '/master/daerah' },
        { name: 'Kategori Muatan', path: '/master/muatan' },
        { name: 'Pelabuhan', path: '/master/pelabuhan' },
      ],
    },
    { 
      id: 'log',
      name: 'Log Aktivitas', 
      path: '/log-aktivitas', 
      icon: <ListIcon />, 
      roles: ['koordinator', 'superuser'] 
    },
    { 
      id: 'mgmt',
      name: 'Manajemen User', 
      path: '/manajemen-user', 
      icon: <UserCircleIcon />, 
      roles: ['superuser'] 
    },
  ], []); 

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  const isSubMenuActive = useCallback((subItems) => {
    return subItems && subItems.some(item => isActive(item.path));
  }, [isActive]);

  useEffect(() => {
    const activeSubmenus = [];
    navItems.forEach((item) => {
      if (isSubMenuActive(item.subItems)) {
        activeSubmenus.push(item.id); 
      }
    });
    setOpenSubmenus(activeSubmenus);
  }, [location.pathname, isSubMenuActive, navItems]);

  useEffect(() => {
    openSubmenus.forEach(id => {
      if (subMenuRefs.current[id]) {
        setSubMenuHeight(prev => ({ ...prev, [id]: subMenuRefs.current[id].scrollHeight }));
      }
    });
  }, [openSubmenus]);

  const handleSubmenuToggle = (id) => {
    setOpenSubmenus(prevOpen => 
      prevOpen.includes(id)
        ? prevOpen.filter(item => item !== id)
        : [...prevOpen, id]
    );
  };
  
  const isSidebarWide = isExpanded || isHovered || isMobileOpen;

  const filteredNavItems = useMemo(() => {
    if (!user || !user.role) {
      return navItems.filter(item => !item.roles);
    }
    const userRole = user.role.toLowerCase();
    return navItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(userRole);
    });
  }, [user, navItems]); 

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white px-5 transition-all duration-300 ease-in-out
        ${isExpanded || isMobileOpen ? 'w-[290px]' : isHovered ? 'w-[290px]' : 'w-[90px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/kementrianperhubungan.png"
            alt="KSOP Logo"
            className="h-11 w-auto"
          />
          {isSidebarWide && (
            <span className="text-xl font-bold text-gray-800">
              Si-Cekatan
            </span>
          )}
        </Link>
      </div>

      <div className="flex flex-col flex-grow py-8 overflow-y-auto no-scrollbar">
        <nav className="flex-grow">
          <h2 className={`mb-4 flex text-xs uppercase text-gray-400
            ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}
          `}>
            {isSidebarWide ? 'Menu' : <HorizontaLDots className="w-6 h-6" />}
          </h2>
          
          <ul className="flex flex-col gap-1.5">
            {filteredNavItems.map((item) => {
              const isParentActive = isSubMenuActive(item.subItems);
              const isOpen = openSubmenus.includes(item.id);
              return (
                <li key={item.id}> 
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => handleSubmenuToggle(item.id)}
                        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                          ${isParentActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}
                          ${!isExpanded && !isHovered ? 'lg:justify-center' : ''}
                        `}
                      >
                        <span className={`menu-item-icon-size ${isParentActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                          {item.icon}
                        </span>
                        {isSidebarWide && (
                          <>
                            <span className="flex-grow text-left">{item.name}</span>
                            <ChevronDownIcon className={`ml-auto h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </>
                        )}
                      </button>
                      {isSidebarWide && (
                        <div
                          ref={el => (subMenuRefs.current[item.id] = el)}
                          className="overflow-hidden transition-all duration-300"
                          style={{ height: isOpen ? `${subMenuHeight[item.id] || 0}px` : '0px' }}
                        >
                          <ul className="mt-2 ml-9 space-y-1">
                            {item.subItems.map(subItem => (
                              <li key={subItem.name}>
                                <Link to={subItem.path} className={`menu-dropdown-item ${isActive(subItem.path) ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}>
                                  {subItem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                        ${isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}
                        ${!isExpanded && !isHovered ? 'lg:justify-center' : ''}
                      `}
                    >
                      <span className={`menu-item-icon-size ${isActive(item.path) ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                        {item.icon}
                      </span>
                      {isSidebarWide && (
                        <span>{item.name}</span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        
        {isSidebarWide && (
          <SidebarWidget />
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;