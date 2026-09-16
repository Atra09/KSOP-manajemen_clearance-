import { useRef, useEffect } from "react";
import Chart from "react-apexcharts";
import { useTheme } from "../../context/ThemeContext";

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
  let isDark = false;
  try {
    const { theme } = useTheme();
    isDark = theme === "dark";
  } catch (e) {
    isDark = document.documentElement.classList.contains("dark");
  }

  const selectedMonthRef = useRef(selectedMonth);
  useEffect(() => {
    selectedMonthRef.current = selectedMonth;
  }, [selectedMonth]);

  const ppk29Data = datas.map(d => (d.ppk_29 !== undefined ? d.ppk_29 : (d.jumlah_perjalanan || 0)));
  const ppk27Data = datas.map(d => (d.ppk_27 !== undefined ? d.ppk_27 : 0));

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
    colors: ["#6366F1", "#EF4444"], // Ungu untuk PPK 29 (bawah), Merah untuk PPK 27 (atas)
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      stacked: true,
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
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
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
    legend: { 
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      labels: {
        colors: '#6B7280'
      }
    },
    yaxis: { title: { text: undefined } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      theme: isDark ? "dark" : "light",
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const monthName = MONTH_NAMES[dataPointIndex] || "";
        const valPPK29 = series[0]?.[dataPointIndex] || 0;
        const valPPK27 = series[1]?.[dataPointIndex] || 0;
        const totalVal = valPPK29 + valPPK27;

        const bg = isDark ? "#0f172a" : "#ffffff";
        const textColor = isDark ? "#ffffff" : "#1f2937";
        const borderColor = isDark ? "#1e293b" : "#e5e7eb";
        const dividerColor = isDark ? "#374151" : "#f3f4f6";
        const headerTextColor = isDark ? "#f3f4f6" : "#111827";
        const val29Color = isDark ? "#a5b4fc" : "#4f46e5";
        const val27Color = isDark ? "#fca5a5" : "#dc2626";
        const totalLabelColor = isDark ? "#d1d5db" : "#4b5563";
        const totalValColor = isDark ? "#f59e0b" : "#d97706";
        const shadow = isDark
          ? "0 10px 25px -5px rgba(0,0,0,0.5)"
          : "0 10px 25px -5px rgba(0,0,0,0.12), 0 4px 6px -4px rgba(0,0,0,0.08)";

        return `
          <div style="padding: 10px 14px; background: ${bg}; color: ${textColor}; border-radius: 12px; border: 1px solid ${borderColor}; font-family: Outfit, sans-serif; font-size: 12px; box-shadow: ${shadow}; transition: all 0.2s ease;">
            <div style="font-weight: 700; border-bottom: 1px solid ${dividerColor}; padding-bottom: 6px; margin-bottom: 8px; color: ${headerTextColor};">
              Bulan ${monthName} ${selectedYear}
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="display: flex; align-items: center; gap: 6px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #6366F1; display: inline-block;"></span>
                  <span>PPK 29:</span>
                </span>
                <strong style="color: ${val29Color};">${valPPK29} clearance</strong>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="display: flex; align-items: center; gap: 6px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #EF4444; display: inline-block;"></span>
                  <span>PPK 27:</span>
                </span>
                <strong style="color: ${val27Color};">${valPPK27} clearance</strong>
              </div>
              <div style="border-top: 1px solid ${dividerColor}; margin-top: 6px; padding-top: 6px; display: flex; justify-content: space-between; gap: 16px;">
                <span style="font-weight: 600; color: ${totalLabelColor};">Jumlah Clearance:</span>
                <strong style="color: ${totalValColor}; font-size: 13px;">${totalVal} clearance</strong>
              </div>
            </div>
          </div>
        `;
      }
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
    { name: "PPK 29", data: ppk29Data },
    { name: "PPK 27", data: ppk27Data },
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