import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import MetricCards from '../components/dashboard/MetricCards';
import MonthlyClearanceBarChart from '../components/dashboard/MonthlyClearanceBarChart';
import CargoCategoryDoughnutChart from '../components/dashboard/CargoCategoryDoughnutChart';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL
  const [totalKapal, setTotalKapal] = useState(0)
  const [totalPerjalanan, setTotalPerjalanan] = useState(0)
  const [totalKapalNow, setTotalKapalNow] = useState(0)
  const [totalPerjalananNow, setTotalPerjalananNow] = useState(0)
  const [totalPerjalananPerBulan, setTotalPerjalananPerBulan] = useState([])
  const [totalKategori, setTotalKategori] = useState([])

  useEffect(() => {
    fetchTotalKapal()
    fetchTotalPerjalanan()
    fetchTotalKapalNow()
    fetchTotalPerjalananNow()
    fetchPerjalananPerBulan()
    fetchTotalKategori()
  }, [])

  const fetchTotalKapal = async () => {
    let response = await axiosInstance.get('/kapal/total');
    setTotalKapal(response.data.datas)
  }

  const fetchTotalPerjalanan = async () => {
    let response = await axiosInstance.get('/perjalanan/total');
    setTotalPerjalanan(response.data.datas)
  }

  const fetchTotalKapalNow = async () => {
    let response = await axiosInstance.get('/kapal/total-today');
    setTotalKapalNow(response.data.datas)
  }

  const fetchTotalPerjalananNow = async () => {
    let response = await axiosInstance.get('/perjalanan/total-today');
    setTotalPerjalananNow(response.data.datas)
  }

  const fetchPerjalananPerBulan = async () => {
    let response = await axiosInstance.get('/perjalanan/total-month');
    setTotalPerjalananPerBulan(response.data.defaultData)
  }

  const fetchTotalKategori = async () => {
    let response = await axiosInstance.get('/perjalanan/total-kategori');
    setTotalKategori(response.data.defaultDatas)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <MetricCards totalKapal={totalKapal} totalPerjalanan={totalPerjalanan} kapalNow={totalKapalNow} perjalananNow={totalPerjalananNow} />
        </div>

        <div className="col-span-12 lg:col-span-8">
          <MonthlyClearanceBarChart datas={totalPerjalananPerBulan} />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <CargoCategoryDoughnutChart datas={totalKategori} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;