import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export const Dropdown = ({ isOpen, onClose, triggerRef, children, className }) => {
  const dropdownRef = useRef(null);
  const [style, setStyle] = useState({});

  useLayoutEffect(() => {
    if (isOpen && triggerRef.current && dropdownRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;

      const position = {
        left: rect.right - dropdownRect.width + window.scrollX,
      };

      if (spaceBelow < dropdownRect.height && rect.top > dropdownRect.height) {
        position.top = rect.top + window.scrollY - dropdownRect.height;
      } else {
        position.top = rect.bottom + window.scrollY;
      }
      
      setStyle(position);
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !triggerRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div ref={dropdownRef} className={className} style={{...style, position: 'absolute', zIndex: 50}} role="menu">
      {children}
    </div>,
    document.body
  );
};