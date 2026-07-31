import React from 'react';

const FileInput = ({ onChange, className }) => {
  return (
    <input
      type="file"
      onChange={onChange}
      className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 ${className || ''}`}
    />
  );
};

export default FileInput;