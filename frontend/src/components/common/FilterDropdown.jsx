import { useState, useEffect, useRef } from 'react';

const FilterDropdown = ({ options, selectedValue, setSelectedValue, placeholder, className, direction = 'down' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (value) => {
    setSelectedValue(value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const directionClasses = direction === 'up' 
    ? 'bottom-full mb-2' 
    : 'top-full mt-2';

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-11 w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
      >
        <span className={selectedValue ? 'text-gray-800' : 'text-gray-500'}>
          {selectedValue || placeholder || 'Pilih Opsi'}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute z-10 w-full rounded-lg border border-gray-200 bg-white shadow-lg ${directionClasses}`}>
          <ul className="max-h-60 overflow-auto rounded-lg p-1">
            {placeholder && (
              <li onClick={() => handleSelect('')} className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100">
                {placeholder}
              </li>
            )}
            {options.map((option, index) => (
              <li key={index} onClick={() => handleSelect(option)} className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;