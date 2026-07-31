import { Link } from 'react-router-dom';

const Button = ({ to, onClick, children, variant = 'primary', className }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition';
  
  const variantClasses = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
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