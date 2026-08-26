import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import MetricCards from '../components/dashboard/MetricCards';
import MonthlyClearanceBarChart from '../components/dashboard/MonthlyClearanceBarChart';
import CargoCategoryDoughnutChart from '../components/dashboard/CargoCategoryDoughnutChart';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const Dashboard = () => {
  const [totalKapal, setTotalKapal] = useState(0);
  const [totalPerjalananNow, setTotalPerjalananNow] = useState(0);
  const [totalKapalNow, setTotalKapalNow] = useState(0);
  const [totalPerjalananPerBulan, setTotalPerjalananPerBulan] = useState([]);
  const [totalKategori, setTotalKategori] = useState([]);
  const [allPerjalanan, setAllPerjalanan] = useState([]);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null); // null = all months in year

  const [statusStats, setStatusStats] = useState({ total: 0, terbit: 0, batal: 0, rusak: 0 });
  const [filteredPerjalananCount, setFilteredPerjalananCount] = useState(0);
  const [clearanceLabel, setClearanceLabel] = useState("Clearance Bulan Ini");

  useEffect(() => {
    fetchTotalKapal();
    fetchTotalKapalNow();
    fetchTotalPerjalananNow();
    fetchAllPerjalanan();
  }, []);

  useEffect(() => {
    fetchPerjalananPerBulan(selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    fetchTotalKategori(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Recalculate metric stats whenever allPerjalanan, selectedYear, or selectedMonth changes
  useEffect(() => {
    if (!allPerjalanan) return;

    const filtered = allPerjalanan.filter(item => {
      if (!item.tanggal_clearance) return false;
      const date = new Date(item.tanggal_clearance);
      const yearMatches = date.getFullYear() === selectedYear;
      if (!yearMatches) return false;

      if (selectedMonth !== null) {
        return (date.getMonth() + 1) === selectedMonth;
      }
      return true;
    });

    let terbit = 0, batal = 0, rusak = 0;
    filtered.forEach(item => {
      const st = (item.status_pelayaran || 'Terbit').toLowerCase();
      if (st === 'batal') batal++;
      else if (st === 'rusak') rusak++;
      else terbit++;
    });

    setStatusStats({
      total: filtered.length,
      terbit,
      batal,
      rusak
    });

    setFilteredPerjalananCount(filtered.length);

    if (selectedMonth !== null) {
      setClearanceLabel(`Clearance ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`);
    } else if (selectedYear === currentYear) {
      const currentMonthFiltered = allPerjalanan.filter(item => {
        if (!item.tanggal_clearance) return false;
        const date = new Date(item.tanggal_clearance);
        return date.getFullYear() === currentYear && (date.getMonth() + 1) === currentMonth;
      });
      setFilteredPerjalananCount(currentMonthFiltered.length);
      setClearanceLabel("Clearance Bulan Ini");
    } else {
      setClearanceLabel(`Total Clearance ${selectedYear}`);
    }

  }, [allPerjalanan, selectedYear, selectedMonth]);

  const fetchTotalKapal = async () => {
    try {
      let response = await axiosInstance.get('/kapal/total');
      setTotalKapal(response.data.datas);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTotalKapalNow = async () => {
    try {
      let response = await axiosInstance.get('/kapal/total-today');
      setTotalKapalNow(response.data.datas);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTotalPerjalananNow = async () => {
    try {
      let response = await axiosInstance.get('/perjalanan/total-today');
      setTotalPerjalananNow(response.data.datas);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPerjalananPerBulan = async (year) => {
    try {
      let response = await axiosInstance.get(`/perjalanan/total-month?year=${year}`);
      setTotalPerjalananPerBulan(response.data.defaultData || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTotalKategori = async (year, month) => {
    try {
      let url = `/perjalanan/total-kategori?year=${year}`;
      if (month !== null && month !== undefined) {
        url += `&month=${month}`;
      }
      let response = await axiosInstance.get(url);
      setTotalKategori(response.data.defaultDatas || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllPerjalanan = async () => {
    try {
      const res = await axiosInstance.get('/perjalanan');
      setAllPerjalanan(res.data?.datas || []);
    } catch (error) {
      console.error("Gagal mengambil data perjalanan untuk dashboard:", error);
    }
  };

  // Build list of available years dynamically from data + fallback (filtering out invalid/typo date years)
  const availableYears = Array.from(
    new Set([
      currentYear,
      ...allPerjalanan
        .map(item => {
          if (!item.tanggal_clearance) return null;
          const y = new Date(item.tanggal_clearance).getFullYear();
          return (y >= 2020 && y <= 2099) ? y : null;
        })
        .filter(Boolean)
    ])
  ).sort((a, b) => b - a);

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <MetricCards 
            totalKapal={totalKapal} 
            totalPerjalanan={filteredPerjalananCount} 
            kapalNow={totalKapalNow} 
            perjalananNow={totalPerjalananNow} 
            statusStats={statusStats}
            clearanceLabel={clearanceLabel}
          />
        </div>

        <div className="col-span-12 lg:col-span-8">
          <MonthlyClearanceBarChart 
            datas={totalPerjalananPerBulan}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onSelectYear={(yr) => {
              setSelectedYear(yr);
              setSelectedMonth(null);
            }}
            availableYears={availableYears}
          />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <CargoCategoryDoughnutChart 
            datas={totalKategori}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;