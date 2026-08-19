import React from 'react';

const InputField = (props) => (
  <input
    {...props}
    className={`h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:dark:bg-gray-800/60 disabled:text-gray-500 disabled:dark:text-gray-400 ${props.className || ''}`}
  />
);

export default InputField;