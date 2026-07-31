import React from 'react';

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
    {children}
  </label>
);

export default Label;