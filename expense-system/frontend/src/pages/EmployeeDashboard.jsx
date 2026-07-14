import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SummaryCards from '../components/SummaryCards';
import ExpenseTable from '../components/ExpenseTable';
import api from '../services/api';

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/employee')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">My Dashboard</h1>
          <Link to="/employee/expenses" className="btn-primary text-sm">
            + New Expense
          </Link>
        </div>
        {loading ? (
          <div className="text-gray-400 text-sm">Loading dashboard...</div>
        ) : (
          <>
            <SummaryCards summary={data.summary} />
            <div className="card">
              <h2 className="font-medium mb-3">Recent Requests</h2>
              <ExpenseTable expenses={data.recent} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
