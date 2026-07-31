import Button from '../ui/Button';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">{title || 'Konfirmasi'}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {message || 'Apakah Anda yakin ingin melanjutkan tindakan ini? Proses ini tidak bisa dibatalkan.'}
          </p>
        </div>
        <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 transition-colors"
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;