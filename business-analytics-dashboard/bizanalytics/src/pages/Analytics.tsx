import React, { useState, useMemo, useCallback, memo } from 'react';
import { monthlyRevenueData, categoryOrderData, regionData } from '../constants/mockData';
import { CATEGORIES, REGIONS } from '../constants/mockData';
import { RevenueLineChart } from '../components/charts/RevenueLineChart';
import { CategoryBarChart } from '../components/charts/CategoryBarChart';
import { RegionPieChart } from '../components/charts/RegionPieChart';
import { RevenueAreaChart } from '../components/charts/RevenueAreaChart';

const FilterBar = memo(({ category, region, dateFrom, dateTo, onCategory, onRegion, onDateFrom, onDateTo, onReset }: {
  category: string; region: string; dateFrom: string; dateTo: string;
  onCategory: (v: string) => void; onRegion: (v: string) => void;
  onDateFrom: (v: string) => void; onDateTo: (v: string) => void; onReset: () => void;
}) => (
  <div className="filter-bar">
    <div className="filter-group">
      <label>From</label>
      <input type="date" className="select" value={dateFrom} onChange={e => onDateFrom(e.target.value)} />
    </div>
    <div className="filter-group">
      <label>To</label>
      <input type="date" className="select" value={dateTo} onChange={e => onDateTo(e.target.value)} />
    </div>
    <div className="filter-group">
      <label>Category</label>
      <select className="select" value={category} onChange={e => onCategory(e.target.value)}>
        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>
    </div>
    <div className="filter-group">
      <label>Region</label>
      <select className="select" value={region} onChange={e => onRegion(e.target.value)}>
        {REGIONS.map(r => <option key={r}>{r}</option>)}
      </select>
    </div>
    <button className="btn-secondary" onClick={onReset} style={{ alignSelf: 'flex-end' }}>Reset</button>
  </div>
));

const Analytics = () => {
  const [category, setCategory] = useState('All');
  const [region, setRegion] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleReset = useCallback(() => {
    setCategory('All'); setRegion('All'); setDateFrom(''); setDateTo('');
  }, []);

  // useMemo: filter data only when filters change
  const filteredCategories = useMemo(() =>
    category === 'All' ? categoryOrderData : categoryOrderData.filter(c => c.category === category),
    [category]);

  const filteredRegions = useMemo(() =>
    region === 'All' ? regionData : regionData.filter(r => r.region === region),
    [region]);

  // Date range applies to the monthly revenue trend by bounding month index;
  // since mock months aren't full dates, we treat from/to as a simple
  // visual filter scaffold ready to wire to real timestamped data.
  const filteredRevenue = useMemo(() => {
    if (!dateFrom && !dateTo) return monthlyRevenueData;
    const fromIdx = dateFrom ? new Date(dateFrom).getMonth() : 0;
    const toIdx = dateTo ? new Date(dateTo).getMonth() : 11;
    return monthlyRevenueData.filter((_, i) => i >= fromIdx && i <= toIdx);
  }, [dateFrom, dateTo]);

  return (
    <div className="page-content">
      <FilterBar
        category={category} region={region} dateFrom={dateFrom} dateTo={dateTo}
        onCategory={setCategory} onRegion={setRegion}
        onDateFrom={setDateFrom} onDateTo={setDateTo} onReset={handleReset}
      />
      <div className="charts-grid">
        <RevenueLineChart data={filteredRevenue} />
        <CategoryBarChart data={filteredCategories} />
        <RegionPieChart data={filteredRegions} />
        <RevenueAreaChart data={filteredRevenue} />
      </div>
    </div>
  );
};

export default Analytics;
