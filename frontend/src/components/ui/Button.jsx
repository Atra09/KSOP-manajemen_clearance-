import { Link } from 'react-router-dom';

const Button = ({ to, onClick, children, variant = 'primary', className }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition';
  
  const variantClasses = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 shadow-xs',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:border dark:border-gray-700 shadow-xs',
    danger: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 shadow-xs',
  };

  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;