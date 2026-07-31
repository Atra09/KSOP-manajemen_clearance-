import { useNavigate } from 'react-router-dom';

const ButtonGroup = ({ to = '/letter-form' }) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3 mb-4">
      <button
        type="button"
        className="inline-flex items-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        onClick={() => navigate(to)}
      >
        Create
      </button>
      <button
        type="button"
        className="inline-flex items-center rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
      >
        Print
      </button>
    </div>
  );
};

export default ButtonGroup;