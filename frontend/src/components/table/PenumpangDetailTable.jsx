const PenumpangDetailTable = ({ data }) => {
    
    const penumpangNaik = data?.penumpang_naik || 0;
    const penumpangTurun = data?.penumpang_turun || 0;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    
                    <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Penumpang Naik</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {penumpangNaik.toLocaleString('id-ID')} Orang
                        </td>
                    </tr>
                    
                    <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Penumpang Turun</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {penumpangTurun.toLocaleString('id-ID')} Orang
                        </td>
                    </tr>
                    
                    {(penumpangNaik === 0 && penumpangTurun === 0) && (
                        <tr>
                            <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                                Tidak ada data penumpang.
                            </td>
                        </tr>
                    )}

                </tbody>
            </table>
        </div>
    );
};

export default PenumpangDetailTable;