import Chart from "react-apexcharts";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const CargoCategoryDoughnutChart = ({
  datas = [],
  selectedYear = new Date().getFullYear(),
  selectedMonth = null,
  onSelectMonth = () => {}
}) => {
  const seriesData = datas.map(d => d.jumlah_kategori_muatan);
  const seriesLabels = datas.map(d => d.status_kategori_muatan || 'Lainnya');

  const options = {
    chart: {
      type: 'donut',
      fontFamily: "Outfit, sans-serif",
    },
    colors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
    labels: seriesLabels.length > 0 ? seriesLabels : ['Umum', 'Berbahaya'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Muatan',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
              }
            }
          }
        }
      }
    },
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 p-5 shadow-sm transition-colors">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Distribusi Kategori Muatan</h3>
          {selectedMonth && (
            <button
              onClick={() => onSelectMonth(null)}
              className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium dark:bg-indigo-950/70 dark:text-indigo-300 transition-colors"
            >
              Lihat Semua
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {selectedMonth 
            ? `Filter Aktif: ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`
            : `Total Kategori Tahun ${selectedYear}`
          }
        </p>
      </div>

      <div className="flex-grow flex items-center justify-center my-auto min-h-[260px]">
        <Chart options={options} series={seriesData.length > 0 ? seriesData : [0, 0]} type="donut" height={320} />
      </div>
    </div>
  );
};

export default CargoCategoryDoughnutChart;