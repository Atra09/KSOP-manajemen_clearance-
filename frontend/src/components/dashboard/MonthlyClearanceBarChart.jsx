import { useRef, useEffect } from "react";
import Chart from "react-apexcharts";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const MonthlyClearanceBarChart = ({
  datas = [],
  selectedYear = new Date().getFullYear(),
  selectedMonth = null,
  onSelectMonth = () => {},
  onSelectYear = () => {},
  availableYears = [2026, 2025, 2024]
}) => {
  const selectedMonthRef = useRef(selectedMonth);
  useEffect(() => {
    selectedMonthRef.current = selectedMonth;
  }, [selectedMonth]);

  const filteredData = datas.map(d => d.jumlah_perjalanan);

  // Custom colors for bars: highlight selected month if active
  const colors = datas.map((_, index) => {
    if (selectedMonth && index === selectedMonth - 1) {
      return "#10B981"; // Emerald/Green for selected month
    }
    return "#4F46E5"; // Default Indigo
  });

  const handleMonthClick = (index) => {
    if (typeof index !== 'number' || index < 0 || index >= 12) return;
    const clickedMonth = index + 1; // 1-12
    const currentSelected = selectedMonthRef.current;
    if (currentSelected === clickedMonth) {
      onSelectMonth(null);
    } else {
      onSelectMonth(clickedMonth);
    }
  };
  
  const options = {
    colors: colors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: { show: false },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          if (config && typeof config.dataPointIndex === 'number' && config.dataPointIndex >= 0) {
            handleMonthClick(config.dataPointIndex);
          }
        },
        click: (event, chartContext, config) => {
          if (config && typeof config.dataPointIndex === 'number' && config.dataPointIndex >= 0) {
            handleMonthClick(config.dataPointIndex);
          }
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 8,
        borderRadiusApplication: "end",
        distributed: true, // Allows per-bar colors
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [ "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des" ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: 0,
        rotateAlways: false,
        style: {
          cursor: 'pointer'
        }
      }
    },
    legend: { show: false },
    yaxis: { title: { text: undefined } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      theme: "dark",
      x: { show: true, formatter: (val) => `Bulan ${val}` },
      y: { formatter: (val) => `${val} clearance` },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          xaxis: {
            labels: {
              rotate: -45,
              style: {
                fontSize: '11px'
              }
            }
          },
          plotOptions: {
            bar: {
              columnWidth: "80%",
            },
          },
        }
      }
    ]
  };

  const series = [
    { name: "Jumlah Clearance", data: filteredData },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 p-5 shadow-sm sm:p-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Grafik Clearance per Bulan
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {selectedMonth && selectedMonth > 0
              ? `Filter Aktif: ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`
              : `Klik batang grafik atau bulan untuk filter per bulan (Tahun ${selectedYear})`
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedMonth && selectedMonth > 0 && (
            <button
              onClick={() => onSelectMonth(null)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium dark:bg-emerald-950/70 dark:text-emerald-300 transition-colors"
            >
              Semua Bulan ({selectedYear})
            </button>
          )}

          <select
            value={selectedYear}
            onChange={(e) => onSelectYear(parseInt(e.target.value))}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>Tahun {year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-grow">
        <Chart options={options} series={series} type="bar" height={350} />
      </div>
    </div>
  );
};

export default MonthlyClearanceBarChart;