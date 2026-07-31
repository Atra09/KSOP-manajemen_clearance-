import React from 'react';

const InputField = (props) => (
  <input
    {...props}
    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20 disabled:bg-gray-50"
  />
);

export default InputField;