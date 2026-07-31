import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isExpanded, setExpanded] = useState(true);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleSidebar = () => {
    setExpanded(!isExpanded);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!isMobileOpen);
  };

  const value = {
    isExpanded,
    isMobileOpen,
    isHovered,
    toggleSidebar,
    toggleMobileSidebar,
    setIsHovered,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

SidebarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};