const MuatanDetailTable = ({ data = [] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kategori Muatan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Muatan</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ton</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">M³</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Liter</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? data.map((item, index) => {
            const catName = String(item.kategori_muatan?.nama_kategori_muatan || item.kategori_muatan?.nama || '').toLowerCase();
            const unitName = String(item.kategori_muatan?.satuan_muatan?.nama_satuan_muatan || item.kategori_muatan?.nama_satuan_muatan || '').toLowerCase();
            const isLiterCat = unitName === 'liter' || ['mitan', 'minyak tanah', 'krosene', 'kerosene', 'kerosine', 'solar', 'bensin'].some(k => catName.includes(k));

            let displayLiter = item.liter;
            let displayTon = item.ton;
            let displayUnit = item.unit;
            let displayM3 = item.m3;

            if (isLiterCat) {
              displayLiter = displayLiter ?? displayUnit ?? displayTon ?? displayM3 ?? null;
              displayTon = null;
              displayUnit = null;
              displayM3 = null;
            }

            return (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.kategori_muatan?.nama_kategori_muatan || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.kategori_muatan?.jenis_muatan?.nama_jenis_muatan || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {displayTon !== null && displayTon !== undefined ? displayTon.toLocaleString('id-ID') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {displayM3 !== null && displayM3 !== undefined ? displayM3.toLocaleString('id-ID') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {displayUnit !== null && displayUnit !== undefined ? displayUnit.toLocaleString('id-ID') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {displayLiter !== null && displayLiter !== undefined ? displayLiter.toLocaleString('id-ID') : '-'}
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MuatanDetailTable;