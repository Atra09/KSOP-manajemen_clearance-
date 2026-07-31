const Badge = ({ color, children }) => {
  const colorClasses = {
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
  };

  const baseClasses = 'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium';

  return (
    <div className={`${baseClasses} ${colorClasses[color] || 'bg-gray-100 text-gray-700'}`}>
      {children}
    </div>
  );
};

export default Badge;