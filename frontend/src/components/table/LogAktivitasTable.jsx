const ActionBadge = ({ action }) => {
  let styleClass = '';
  switch (String(action).toUpperCase()) {
    case 'CREATE':
      styleClass = 'bg-green-100 text-green-800';
      break;
    case 'UPDATE':
      styleClass = 'bg-blue-100 text-blue-800';
      break;
    case 'DELETE':
      styleClass = 'bg-red-100 text-red-800';
      break;
    case 'LOGIN':
      styleClass = 'bg-yellow-100 text-yellow-800';
      break;
    default:
      styleClass = 'bg-gray-100 text-gray-800';
  }
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styleClass}`}>
      {action}
    </span>
  );
};

const LogAktivitasTable = ({ logItems = [] }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Data</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data yang Diubah</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logItems.length > 0 ? (
            logItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.user}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <ActionBadge action={item.action} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.dataType}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.changedData}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                Tidak ada data log yang cocok.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LogAktivitasTable;