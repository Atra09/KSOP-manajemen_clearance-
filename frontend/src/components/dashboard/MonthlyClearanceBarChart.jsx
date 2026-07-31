import Chart from "react-apexcharts";

const MonthlyClearanceBarChart = ({datas}) => {
  const filteredData = datas.map(d => d.jumlah_perjalanan)
  
  const options = {
    colors: ["#4F46E5"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 8,
        borderRadiusApplication: "end",
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
        rotateAlways: false
      }
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    yaxis: { title: { text: undefined } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
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
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Grafik Clearance per Bulan
        </h3>
      </div>
      <div className="flex-grow">
        <Chart options={options} series={series} type="bar" height={350} />
      </div>
    </div>
  );
};

export default MonthlyClearanceBarChart;