import React from 'react';

const TextArea = (props) => (
  <textarea
    {...props}
    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20"
  />
);

export default TextArea;