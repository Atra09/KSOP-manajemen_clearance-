import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

const Select = ({ options, value, onChange, name, id, required, placeholder = "Cari..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const menuRef = useRef(null);
  const ulRef = useRef(null);
  const searchInputRef = useRef(null);

  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const [direction, setDirection] = useState('down');

  const selectedLabel = options.find(opt => opt.value === value)?.label || 
    (options[0]?.value === '' ? options[0]?.label : 'Pilih Opsi');

  const filteredOptions = options.filter((option) => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateMenuPosition = useCallback(() => {
    if (!selectRef.current) {
      setIsOpen(false);
      return;
    }
    const rect = selectRef.current.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = Math.min(250, options.length * 40);
    
    if (spaceBelow < menuHeight && rect.top > menuHeight) {
      setDirection('up');
    } else {
      setDirection('down');
    }
    
    setMenuPosition({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
    });
  }, [options.length]);

  const toggleDropdown = () => {
    if (!isOpen) {
      updateMenuPosition();
      setSearchTerm(''); 
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectRef.current && !selectRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    let scrollableParent = selectRef.current?.parentElement;
    let found = false;
    while (scrollableParent && !found) {
      if (scrollableParent.tagName === 'BODY') break;
      const style = window.getComputedStyle(scrollableParent);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        found = true;
        break;
      }
      scrollableParent = scrollableParent.parentElement;
    }

    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    
    if (found && scrollableParent) {
      scrollableParent.addEventListener('scroll', updateMenuPosition);
    }

    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
      if (found && scrollableParent) {
        scrollableParent.removeEventListener('scroll', updateMenuPosition);
      }
    };
  }, [isOpen, updateMenuPosition]);

  const DropdownMenu = (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: direction === 'down' ? `${menuPosition.bottom + 4}px` : 'auto', 
        bottom: direction === 'up' ? `${window.innerHeight - menuPosition.top + 4}px` : 'auto', 
        left: `${menuPosition.left}px`,
        width: `${menuPosition.width}px`,
        zIndex: 9999,
      }}
      className="bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col overflow-hidden"
      onWheel={(e) => {
        const ul = ulRef.current;
        if (!ul) return;
        const { scrollTop, scrollHeight, clientHeight } = ul;
        const isAtTop = scrollTop === 0;
        const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
        const isScrollable = scrollHeight > clientHeight;
        
        if (!isScrollable) return;
        
        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        }
      }}
    >
      <div className="p-2 border-b border-gray-100 bg-white sticky top-0 z-10">
        <input
          ref={searchInputRef}
          type="text"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <ul 
        ref={ulRef}
        className="py-1 max-h-60 overflow-y-auto"
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => (
            (!option.disabled || (index === 0 && !searchTerm)) && (
              <li
                key={option.value}
                className={`px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer ${
                  option.value === value ? 'bg-indigo-50 font-medium text-indigo-700' : ''
                }`}
                onClick={() => {
                  onChange({ target: { name, value: option.value } });
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                {option.label}
              </li>
            )
          ))
        ) : (
          <li className="px-4 py-2 text-sm text-gray-500 text-center">
            Data tidak ditemukan
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <div className="relative w-full" ref={selectRef}>
      <select 
        name={name} 
        id={id} 
        value={value} 
        required={required} 
        onChange={onChange}
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%',
          height: '100%', opacity: 0, pointerEvents: 'none', zIndex: -1 
        }}
        tabIndex={-1}
      >
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      
      <button
        type="button"
        className={`w-full h-11 px-4 text-left bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between ${
            isOpen ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'
        }`}
        onClick={toggleDropdown}
      >
        <span className="truncate block mr-2 text-gray-700">
            {selectedLabel}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && ReactDOM.createPortal(DropdownMenu, document.body)}
    </div>
  );
};

export default Select;