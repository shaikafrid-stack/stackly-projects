import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { StatCard, Spinner } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get(`/dashboard/${user.role}`);
        setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.role]);

  const cardsFor = {
    admin: stats && [
      { label: 'Total Employees', value: stats.totalEmployees },
      { label: 'Total Trainers', value: stats.totalTrainers },
      { label: 'Active Trainings', value: stats.activeTrainings },
      { label: 'Completed Trainings', value: stats.completedTrainings },
      { label: 'Overall Completion Rate', value: `${stats.overallCompletionRate}%` },
    ],
    trainer: stats && [
      { label: 'Total Training Programs', value: stats.totalPrograms },
      { label: 'Active Sessions', value: stats.activeSessions },
      { label: 'Employees Trained', value: stats.employeesTrained },
      { label: 'Certificates Issued', value: stats.certificatesIssued },
    ],
    employee: stats && [
      { label: 'Enrolled Trainings', value: stats.enrolledTrainings },
      { label: 'Completed Trainings', value: stats.completedTrainings },
      { label: 'Pending Trainings', value: stats.pendingTrainings },
      { label: 'Certifications Earned', value: stats.certificationsEarned },
    ],
  };

  const cards = cardsFor[user.role] || [];
  const chartData = cards.filter((c) => typeof c.value === 'number');

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1 capitalize">
          {user.role} Dashboard
        </h1>
        <p className="text-sm text-gray-500 mb-6">Welcome back, {user.name}.</p>

        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {cards.map((c) => (
                <StatCard key={c.label} label={c.label} value={c.value} />
              ))}
            </div>

            {chartData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">Overview</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b5bfd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
