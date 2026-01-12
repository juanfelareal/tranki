import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Download, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart
} from 'recharts';
import { reportsAPI } from '../utils/api';
import { formatCOP, formatCompact, getCurrentPeriod, formatMonth } from '../utils/formatters';
import { useIsMobile } from '../hooks/useMediaQuery';

// Paleta monocromática fintech
const CHART_COLORS = [
  '#0A0A0A', '#1F2937', '#374151', '#4B5563',
  '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB'
];

const Reports = () => {
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [summaryRes, categoryRes, trendRes, topRes] = await Promise.all([
        reportsAPI.getSummary({ month: period.month, year: period.year }),
        reportsAPI.getByCategory({ month: period.month, year: period.year, type: 'expense' }),
        reportsAPI.getMonthlyTrend({ months: 12 }),
        reportsAPI.getTopExpenses({ month: period.month, year: period.year, limit: 10 })
      ]);

      setSummary(summaryRes.data);
      setCategoryData(categoryRes.data || []);
      setTrendData(trendRes.data || []);
      setTopExpenses(topRes.data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (direction) => {
    setPeriod(prev => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;

      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }

      return { month: newMonth, year: newYear };
    });
  };

  const exportData = () => {
    let csv = 'Tipo,Categoría,Monto\n';
    categoryData.forEach(c => {
      csv += `Gasto,${c.name},${c.total}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tranki-reporte-${period.year}-${period.month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-10 w-48 shimmer rounded-xl" />
          <div className="h-5 w-64 shimmer rounded-lg" />
        </div>
        <div className="h-14 shimmer rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-28 shimmer rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 shimmer rounded-2xl" />
          <div className="h-64 shimmer rounded-2xl" />
        </div>
        <div className="h-72 shimmer rounded-2xl" />
      </div>
    );
  }

  const incomeTotal = summary?.income || 0;
  const expenseTotal = summary?.expenses || 0;
  const balance = incomeTotal - expenseTotal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Reportes</h1>
          <p className="text-muted mt-1">Análisis detallado de tus finanzas</p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-border/50 rounded-full font-medium text-secondary hover:text-primary hover:border-primary btn-scale transition-all"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Exportar CSV</span>
        </button>
      </div>

      {/* Period Selector */}
      <div className="glass-card border border-border/50 rounded-2xl p-4 flex items-center justify-center gap-6">
        <button
          onClick={() => handlePeriodChange(-1)}
          className="p-2.5 text-muted hover:text-primary rounded-xl hover:bg-black/5 transition-all duration-75"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/5 rounded-xl">
            <Calendar size={18} className="text-primary" />
          </div>
          <span className="font-semibold text-primary text-lg capitalize tracking-tight">
            {formatMonth(period.month, period.year)}
          </span>
        </div>
        <button
          onClick={() => handlePeriodChange(1)}
          className="p-2.5 text-muted hover:text-primary rounded-xl hover:bg-black/5 transition-all duration-75"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card border border-border/50 rounded-2xl p-6 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-income/10 rounded-xl">
              <TrendingUp size={18} className="text-income" />
            </div>
            <span className="text-sm font-medium text-muted">Ingresos</span>
          </div>
          <p className="text-3xl font-bold text-primary tabular-nums tracking-tight">
            {formatCOP(incomeTotal)}
          </p>
        </div>

        <div className="glass-card border border-border/50 rounded-2xl p-6 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-expense/10 rounded-xl">
              <TrendingDown size={18} className="text-expense" />
            </div>
            <span className="text-sm font-medium text-muted">Gastos</span>
          </div>
          <p className="text-3xl font-bold text-primary tabular-nums tracking-tight">
            {formatCOP(expenseTotal)}
          </p>
        </div>

        <div className={`rounded-2xl p-6 card-hover border ${
          balance >= 0
            ? 'bg-income/5 border-income/20'
            : 'bg-expense/5 border-expense/20'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-xl ${balance >= 0 ? 'bg-income/10' : 'bg-expense/10'}`}>
              <BarChart3 size={18} className={balance >= 0 ? 'text-income' : 'text-expense'} />
            </div>
            <span className="text-sm font-medium text-muted">Balance</span>
          </div>
          <p className={`text-3xl font-bold tabular-nums tracking-tight ${
            balance >= 0 ? 'text-income' : 'text-expense'
          }`}>
            {balance >= 0 ? '+' : ''}{formatCOP(balance)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Pie Chart) */}
        <div className="glass-card border border-border/50 rounded-2xl p-6">
          <h3 className="font-semibold text-primary text-lg tracking-tight mb-5">Gastos por categoría</h3>
          {categoryData.length > 0 ? (() => {
            const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.total, 0);
            return (
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row items-center'} gap-6`}>
                <div className={`${isMobile ? 'w-32 h-32 mx-auto' : 'w-40 h-40'} flex-shrink-0`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 35 : 45}
                        outerRadius={isMobile ? 55 : 70}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCOP(value)}
                        contentStyle={{
                          backgroundColor: '#0A0A0A',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '12px',
                          padding: '8px 12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3 max-h-44 overflow-y-auto">
                  {categoryData.map((cat, index) => {
                    const percentage = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
                    return (
                      <div
                        key={cat.id}
                        className="group animate-fadeIn"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="text-sm text-secondary group-hover:text-primary transition-colors truncate">
                              {cat.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-primary ml-2">
                            {formatCompact(cat.total)}
                          </span>
                        </div>
                        <div className="h-1 bg-black/5 rounded-full overflow-hidden ml-4">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })() : (
            <div className="h-44 flex items-center justify-center text-muted">
              <p>No hay datos</p>
            </div>
          )}
        </div>

        {/* Monthly Comparison (Bar Chart) */}
        <div className="glass-card border border-border/50 rounded-2xl p-6">
          <h3 className="font-semibold text-primary text-lg tracking-tight mb-5">Comparación mensual</h3>
          {trendData.length > 0 ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData.slice(-6)} barGap={8}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#A3A3A3' }}
                    tickFormatter={(v) => v.split('-')[1]}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value) => formatCOP(value)}
                    contentStyle={{
                      backgroundColor: '#0A0A0A',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '12px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="income" name="Ingresos" fill="#0A0A0A" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Gastos" fill="#9CA3AF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-muted">
              <p>No hay datos</p>
            </div>
          )}
        </div>

        {/* Trend Line */}
        <div className="glass-card border border-border/50 rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-semibold text-primary text-lg tracking-tight mb-5">Tendencia anual</h3>
          {trendData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorIncomeReport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A0A0A" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#0A0A0A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenseReport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9CA3AF" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#9CA3AF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#A3A3A3' }}
                    tickFormatter={(v) => {
                      const [y, m] = v.split('-');
                      return `${m}/${y.slice(2)}`;
                    }}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value) => formatCOP(value)}
                    contentStyle={{
                      backgroundColor: '#0A0A0A',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '12px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                    labelStyle={{ color: '#fff', marginBottom: '4px' }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => (
                      <span style={{ color: '#525252', fontSize: '12px' }}>{value}</span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Ingresos"
                    stroke="#0A0A0A"
                    fill="url(#colorIncomeReport)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Gastos"
                    stroke="#9CA3AF"
                    fill="url(#colorExpenseReport)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-muted">
              <p>No hay datos suficientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Expenses */}
      <div className="glass-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 bg-black/[0.01]">
          <h3 className="font-semibold text-primary text-lg tracking-tight">Mayores gastos del mes</h3>
        </div>
        {topExpenses.length > 0 ? (
          <div className="divide-y divide-border/50">
            {topExpenses.map((tx, idx) => (
              <div
                key={tx.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-black/[0.01] transition-all animate-fadeIn"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <span className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center text-xs font-semibold text-muted">
                  {idx + 1}
                </span>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
                  style={{ backgroundColor: `${tx.category_color || '#E5E7EB'}15` }}
                >
                  {tx.category_icon || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary truncate">
                    {tx.description || tx.category_name || 'Gasto'}
                  </p>
                  <p className="text-sm text-muted">{tx.category_name}</p>
                </div>
                <p className="font-semibold text-expense tabular-nums text-lg">
                  -{formatCOP(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-lg font-medium text-primary">No hay gastos este mes</p>
            <p className="text-sm text-muted mt-1">Los gastos aparecerán aquí</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
