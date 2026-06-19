import type {
  Customer, Order, Product, RevenueRecord, Report, Activity,
  MonthlyRevenue, CategoryData, RegionData,
} from '../types';

const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
const categories = ['Electronics', 'Software', 'Services', 'Hardware', 'Consulting'];
const segments: Customer['segment'][] = ['Enterprise', 'SMB', 'Startup', 'Individual'];
const statuses: Customer['status'][] = ['Active', 'Active', 'Active', 'Inactive', 'Churned'];
const orderStatuses: Order['status'][] = ['Completed', 'Completed', 'Completed', 'Pending', 'Cancelled', 'Refunded'];
const reportTypes: Report['type'][] = ['Revenue', 'Customer', 'Operations', 'Marketing', 'Inventory'];
const reportStatuses: Report['status'][] = ['Published', 'Published', 'Draft', 'Archived', 'Processing'];

const firstNames = ['Alice','Bob','Carol','David','Eve','Frank','Grace','Henry','Iris','James','Karen','Leo','Maya','Noah','Olivia','Peter','Quinn','Rachel','Sam','Tara','Uma','Victor','Wendy','Xander','Yara','Zack','Anna','Brian','Chloe','Derek','Emma','Felix','Gina','Hugo','Isla','Jake','Lena','Mike','Nina','Oscar','Pam','Rex','Sara','Tom','Vera','Will','Xena','Yuki','Zoe','Chris','Dana'];
const lastNames = ['Smith','Jones','Brown','Taylor','Wilson','Davis','Miller','Moore','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Garcia','Martinez','Robinson','Clark','Rodriguez','Lewis','Lee','Walker','Hall','Allen','Young','King','Wright','Scott','Green','Baker','Adams','Nelson','Carter','Mitchell','Perez','Roberts','Turner','Phillips','Campbell'];
const companies = ['TechCorp','GlobalSoft','DataPro','CloudSys','NetWorks','InfoTech','DigiSol','SmartBase','CoreTech','FutureSys'];

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rndNum(min: number, max: number, decimals = 0): number {
  const n = Math.random() * (max - min) + min;
  return decimals ? parseFloat(n.toFixed(decimals)) : Math.floor(n);
}
function rndDate(daysBack = 365): string {
  const d = new Date(2024, 0, 1);
  d.setDate(d.getDate() + rndNum(0, daysBack));
  return d.toISOString().split('T')[0];
}
function makeId(prefix: string, n: number): string { return `${prefix}-${String(n).padStart(4,'0')}`; }

// Seeded random for reproducibility
let seed = 42;
function seededRandom(): number {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 0) / 0xffffffff;
}
function srnd<T>(arr: T[]): T { return arr[Math.floor(seededRandom() * arr.length)]; }
function srndNum(min: number, max: number, decimals = 0): number {
  const n = seededRandom() * (max - min) + min;
  return decimals ? parseFloat(n.toFixed(decimals)) : Math.floor(n);
}
function srndDate(base: number, range: number): string {
  const d = new Date(2024, 0, 1);
  d.setDate(d.getDate() + Math.floor(seededRandom() * range) + base);
  return d.toISOString().split('T')[0];
}

export const mockCustomers: Customer[] = Array.from({ length: 120 }, (_, i) => {
  const first = srnd(firstNames);
  const last = srnd(lastNames);
  return {
    id: makeId('CUS', i + 1),
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@${srnd(companies).toLowerCase()}.com`,
    region: srnd(regions),
    segment: srnd(segments),
    totalSpent: srndNum(500, 150000, 2),
    orders: srndNum(1, 45),
    joinedDate: srndDate(0, 700),
    status: srnd(statuses),
  };
});

const productList = [
  { name: 'Pro License', category: 'Software' },
  { name: 'Cloud Storage 1TB', category: 'Software' },
  { name: 'Laptop Elite', category: 'Hardware' },
  { name: 'Dev Console', category: 'Electronics' },
  { name: 'API Gateway', category: 'Software' },
  { name: 'Support Package', category: 'Services' },
  { name: 'Data Analytics Suite', category: 'Software' },
  { name: 'Security Audit', category: 'Consulting' },
  { name: 'Smart Monitor', category: 'Electronics' },
  { name: 'Network Switch 48P', category: 'Hardware' },
  { name: 'CRM Module', category: 'Software' },
  { name: 'AI Assistant', category: 'Software' },
  { name: 'Training Workshop', category: 'Services' },
  { name: 'Workstation Pro', category: 'Hardware' },
  { name: 'IoT Sensor Kit', category: 'Electronics' },
];

export const mockOrders: Order[] = Array.from({ length: 150 }, (_, i) => {
  const cust = mockCustomers[i % mockCustomers.length];
  const prod = srnd(productList);
  const qty = srndNum(1, 20);
  const unitPrice = srndNum(50, 5000, 2);
  return {
    id: makeId('ORD', i + 1),
    customerId: cust.id,
    customerName: cust.name,
    product: prod.name,
    category: prod.category,
    quantity: qty,
    unitPrice,
    totalAmount: parseFloat((qty * unitPrice).toFixed(2)),
    status: srnd(orderStatuses),
    region: cust.region,
    date: srndDate(0, 365),
  };
});

export const mockProducts: Product[] = Array.from({ length: 105 }, (_, i) => {
  const base = productList[i % productList.length];
  return {
    id: makeId('PRD', i + 1),
    name: i < productList.length ? base.name : `${base.name} v${Math.floor(i / productList.length) + 2}`,
    category: base.category,
    price: srndNum(50, 5000, 2),
    stock: srndNum(0, 500),
    sold: srndNum(10, 300),
    revenue: srndNum(5000, 200000, 2),
    trend: srnd(['up', 'down', 'stable'] as Product['trend'][]),
  };
});

export const mockRevenueRecords: RevenueRecord[] = Array.from({ length: 120 }, (_, i) => {
  const year = i < 60 ? 2023 : 2024;
  const month = String((i % 12) + 1).padStart(2, '0');
  const revenue = srndNum(50000, 300000, 2);
  const expenses = parseFloat((revenue * srndNum(40, 75, 0) / 100).toFixed(2));
  return { month, year, revenue, expenses, profit: parseFloat((revenue - expenses).toFixed(2)), region: srnd(regions) };
});

export const mockReports: Report[] = Array.from({ length: 100 }, (_, i) => {
  const type = srnd(reportTypes);
  const q = srndNum(1, 4);
  const yr = 2023 + srndNum(0, 1);
  return {
    id: makeId('RPT', i + 1),
    name: `${type} Analysis Q${q} ${yr}`,
    type,
    createdDate: srndDate(0, 350),
    updatedDate: srndDate(300, 60),
    status: srnd(reportStatuses),
    createdBy: `${srnd(firstNames)} ${srnd(lastNames)}`,
    size: `${srndNum(1, 50)}.${srndNum(1, 9)} MB`,
    description: `Comprehensive ${type.toLowerCase()} analysis covering key metrics, trends, and actionable insights for Q${q} ${yr}.`,
  };
});

const activityMessages = [
  { type: 'order' as const, msg: 'New order placed', sev: 'success' as const },
  { type: 'customer' as const, msg: 'New customer registered', sev: 'info' as const },
  { type: 'report' as const, msg: 'Monthly report generated', sev: 'info' as const },
  { type: 'alert' as const, msg: 'Low stock alert triggered', sev: 'warning' as const },
  { type: 'order' as const, msg: 'Order cancelled', sev: 'error' as const },
  { type: 'system' as const, msg: 'Backup completed successfully', sev: 'success' as const },
  { type: 'customer' as const, msg: 'Customer upgraded to Enterprise', sev: 'success' as const },
  { type: 'alert' as const, msg: 'High API traffic detected', sev: 'warning' as const },
  { type: 'order' as const, msg: 'Payment processed', sev: 'success' as const },
  { type: 'system' as const, msg: 'Data sync completed', sev: 'info' as const },
];

export const mockActivities: Activity[] = Array.from({ length: 100 }, (_, i) => {
  const tpl = activityMessages[i % activityMessages.length];
  const name = `${srnd(firstNames)} ${srnd(lastNames)}`;
  const d = new Date(2024, 11, 31);
  d.setMinutes(d.getMinutes() - i * 37);
  return {
    id: makeId('ACT', i + 1),
    type: tpl.type,
    message: `${tpl.msg} by ${name}`,
    timestamp: d.toISOString(),
    user: name,
    severity: tpl.sev,
  };
});

export const monthlyRevenueData: MonthlyRevenue[] = [
  { month: 'Jan', revenue: 125000, expenses: 78000, profit: 47000 },
  { month: 'Feb', revenue: 142000, expenses: 85000, profit: 57000 },
  { month: 'Mar', revenue: 158000, expenses: 91000, profit: 67000 },
  { month: 'Apr', revenue: 139000, expenses: 80000, profit: 59000 },
  { month: 'May', revenue: 175000, expenses: 98000, profit: 77000 },
  { month: 'Jun', revenue: 192000, expenses: 105000, profit: 87000 },
  { month: 'Jul', revenue: 183000, expenses: 101000, profit: 82000 },
  { month: 'Aug', revenue: 210000, expenses: 112000, profit: 98000 },
  { month: 'Sep', revenue: 228000, expenses: 120000, profit: 108000 },
  { month: 'Oct', revenue: 245000, expenses: 128000, profit: 117000 },
  { month: 'Nov', revenue: 268000, expenses: 138000, profit: 130000 },
  { month: 'Dec', revenue: 295000, expenses: 148000, profit: 147000 },
];

export const categoryOrderData: CategoryData[] = [
  { category: 'Software', orders: 450, revenue: 892000 },
  { category: 'Hardware', orders: 320, revenue: 675000 },
  { category: 'Services', orders: 280, revenue: 540000 },
  { category: 'Electronics', orders: 390, revenue: 720000 },
  { category: 'Consulting', orders: 160, revenue: 480000 },
];

export const regionData: RegionData[] = [
  { region: 'North America', customers: 38, revenue: 1250000, orders: 520 },
  { region: 'Europe', customers: 29, revenue: 980000, orders: 390 },
  { region: 'Asia Pacific', customers: 24, revenue: 720000, orders: 310 },
  { region: 'Latin America', customers: 18, revenue: 420000, orders: 200 },
  { region: 'Middle East', customers: 11, revenue: 310000, orders: 130 },
];

export const CATEGORIES = ['All', ...categories];
export const REGIONS = ['All', ...regions];
// suppress unused warning
void rnd; void rndNum; void rndDate;
