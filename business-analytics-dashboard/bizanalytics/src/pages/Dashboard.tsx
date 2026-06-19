import React, { useMemo, memo } from 'react';
import { mockCustomers, mockOrders, mockActivities, monthlyRevenueData, categoryOrderData, regionData } from '../constants/mockData';
import { formatCurrency, formatTimestamp, formatNumber } from '../utils';
import { RevenueLineChart } from '../components/charts/RevenueLineChart';
import { RegionPieChart } from '../components/charts/RegionPieChart';

const KPICard = memo(({ label, value, change, icon, color }: { label: string; value: string; change: number; icon: string; color: string }) => (
  <div className="kpi-card" style={{ borderTopColor: color }}>
    <div className="kpi-header">
      <span className="kpi-icon">{icon}</span>
      <span className={`kpi-badge ${change >= 0 ? 'badge-up' : 'badge-down'}`}>
        {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
      </span>
    </div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-label">{label}</div>
  </div>
));

const Dashboard = () => {
  // useMemo: expensive aggregations cached
  const kpis = useMemo(() => {
    const totalRevenue = monthlyRevenueData.reduce((s, r) => s + r.revenue, 0);
    const totalCustomers = mockCustomers.length;
    const totalOrders = mockOrders.length;
    const activeUsers = mockCustomers.filter(c => c.status === 'Active').length;
    const completedOrders = mockOrders.filter(o => o.status === 'Completed').length;
    const growth = ((monthlyRevenueData[11].revenue - monthlyRevenueData[10].revenue) / monthlyRevenueData[10].revenue) * 100;
    return [
      { label: 'Total Revenue', value: formatCurrency(totalRevenue, true), change: 18.4, icon: '💰', color: '#6366f1' },
      { label: 'Total Customers', value: formatNumber(totalCustomers), change: 12.1, icon: '👥', color: '#22c55e' },
      { label: 'Total Orders', value: formatNumber(totalOrders), change: -3.2, icon: '🛒', color: '#f59e0b' },
      { label: 'Active Users', value: formatNumber(activeUsers), change: 8.7, icon: '✅', color: '#06b6d4' },
      { label: 'Growth Rate', value: `${growth.toFixed(1)}%`, change: growth, icon: '📈', color: '#a855f7' },
      { label: 'Completed Orders', value: formatNumber(completedOrders), change: 5.3, icon: '✔️', color: '#ec4899' },
    ];
  }, []);

  const recentActivities = useMemo(() => mockActivities.slice(0, 10), []);
  const topCategories = useMemo(() => [...categoryOrderData].sort((a, b) => b.revenue - a.revenue), []);

  return (
    <div className="page-content">
      <div className="kpi-grid">
        {kpis.map(k => <KPICard key={k.label} {...k} />)}
      </div>

      <div className="charts-row">
        <div style={{ flex: 2 }}>
          <RevenueLineChart data={monthlyRevenueData} />
        </div>
        <div style={{ flex: 1 }}>
          <RegionPieChart data={regionData} />
        </div>
      </div>

      <div className="bottom-row">
        <div className="card">
          <h3 className="card-title">Top Categories</h3>
          <table className="mini-table">
            <thead><tr><th>Category</th><th>Orders</th><th>Revenue</th></tr></thead>
            <tbody>
              {topCategories.map(c => (
                <tr key={c.category}>
                  <td>{c.category}</td>
                  <td>{formatNumber(c.orders)}</td>
                  <td>{formatCurrency(c.revenue, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card activity-feed">
          <h3 className="card-title">Recent Activity</h3>
          <ul className="activity-list">
            {recentActivities.map(a => (
              <li key={a.id} className={`activity-item sev-${a.severity}`}>
                <div className="activity-dot" />
                <div className="activity-body">
                  <p>{a.message}</p>
                  <span className="activity-time">{formatTimestamp(a.timestamp)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
