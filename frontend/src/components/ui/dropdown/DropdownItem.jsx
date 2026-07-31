import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export const DropdownItem = ({ to, onItemClick, className, children, tag = 'link' }) => {
  const commonProps = {
    className,
    onClick: onItemClick,
  };

  if (tag === 'button') {
    return <button {...commonProps}>{children}</button>;
  }

  return (
    <Link to={to || '#'} {...commonProps}>
      {children}
    </Link>
  );
};

DropdownItem.propTypes = {
  to: PropTypes.string,
  onItemClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  tag: PropTypes.oneOf(['link', 'button']),
};