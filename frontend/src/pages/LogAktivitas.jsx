import { useState, useEffect, useCallback, useRef } from 'react';
import LogAktivitasTable from '../components/table/LogAktivitasTable';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import InputField from '../components/form/InputField';
import axiosInstance from '../api/axiosInstance'; 
import debounce from 'lodash.debounce';

const rowsPerPageOptions = ['5', '10', '20', '50'];

function LogAktivitas() {
    const [logData, setLogData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    
    const [filterOptions, setFilterOptions] = useState({
        users: [],
        actions: [],
        dataTypes: [],
    });

    const [filters, setFilters] = useState({ 
        searchTerm: '', 
        startDate: '', 
        endDate: '', 
        selectedUser: '', 
        selectedAction: '', 
        selectedDataType: '' 
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchLogs = useCallback(async (page, limit, currentFilters) => {
        setLoading(true);
        let endpoint = '/log-user';
        let params = {
            page: page,
            limit: limit,
        };

        if (currentFilters.searchTerm) {
            params.search = currentFilters.searchTerm;
        } else {
            endpoint = '/log-user/get-filter';
            Object.assign(params, {
                username: currentFilters.selectedUser,
                aksi: currentFilters.selectedAction,
                jenis_data: currentFilters.selectedDataType,
                tanggal_awal: currentFilters.startDate,
                tanggal_akhir: currentFilters.endDate,
            });
        }
        
        Object.keys(params).forEach(key => {
            if (!params[key]) delete params[key];
        });
        
        try {
            const response = await axiosInstance.get(endpoint, { params });
            setLogData(response.data.datas);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Gagal mengambil data log:", error);
            setLogData([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedFetch = useCallback(debounce((p, l, f) => fetchLogs(p, l, f), 500), [fetchLogs]);

    useEffect(() => {
        debouncedFetch(currentPage, rowsPerPage, filters);

        return () => {
            debouncedFetch.cancel();
        };
    }, [currentPage, rowsPerPage, filters, debouncedFetch]);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const response = await axiosInstance.get('/log-user');
                const allData = response.data.datas;
                setFilterOptions({
                    users: [...new Set(allData.map(item => item.username))],
                    actions: [...new Set(allData.map(item => item.aksi))],
                    dataTypes: [...new Set(allData.map(item => item.jenis_data))],
                });
            } catch (error) {
                console.error("Gagal mengambil opsi filter:", error);
            }
        };
        fetchFilterOptions();
    }, []);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };
    
    const handleRowsPerPageChange = (value) => {
        setRowsPerPage(parseInt(value, 10));
        setCurrentPage(1);
    };

    const mappedData = logData.map(item => ({
        id: item.id_log_user,
        timestamp: item.createdAt, 
        user: item.username,
        action: item.aksi,
        dataType: item.jenis_data,
        changedData: item.data_diubah
    }));

    return (
        <div className="p-4 md:p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Log Aktivitas</h1>
            
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="space-y-4 border-b border-gray-200 p-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex-grow">
                            <SearchBar searchTerm={filters.searchTerm} setSearchTerm={(value) => handleFilterChange('searchTerm', value)} placeholder="Cari pengguna atau data..." />
                        </div>
                        <div className="w-full md:w-auto md:min-w-[200px]">
                            <FilterDropdown options={filterOptions.users} selectedValue={filters.selectedUser} setSelectedValue={(value) => handleFilterChange('selectedUser', value)} placeholder="Semua Pengguna" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 md:grid-cols-3">
                        <FilterDropdown options={filterOptions.actions} selectedValue={filters.selectedAction} setSelectedValue={(value) => handleFilterChange('selectedAction', value)} placeholder="Semua Aksi" />
                        <FilterDropdown options={filterOptions.dataTypes} selectedValue={filters.selectedDataType} setSelectedValue={(value) => handleFilterChange('selectedDataType', value)} placeholder="Semua Jenis Data" />
                        <div className="flex flex-col sm:flex-row items-center gap-2 ">
                            <InputField type="date" name="startDate" value={filters.startDate} onChange={(e) => handleFilterChange(e.target.name, e.target.value)} />
                            <span className="text-gray-500 hidden sm:block">-</span>
                            <InputField type="date" name="endDate" value={filters.endDate} onChange={(e) => handleFilterChange(e.target.name, e.target.value)} />
                        </div>
                    </div>
                </div>
                
                {loading ? <p className="text-center text-gray-500 py-10">Memuat data...</p> : <LogAktivitasTable logItems={mappedData} />}
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span>Tampilkan</span>
                        <FilterDropdown 
                            direction="up" 
                            selectedValue={String(rowsPerPage)} 
                            setSelectedValue={handleRowsPerPageChange} 
                            options={rowsPerPageOptions} 
                        />
                        <span>baris</span>
                    </div>
                    {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={setCurrentPage} />}
                </div>
            </div>
        </div>
    );
}

export default LogAktivitas;