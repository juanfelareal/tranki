import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { reportsAPI } from '../utils/api';
import { formatCOP, formatCompact, formatRelativeDate, formatMonth, formatPercentageChange, getCurrentPeriod } from '../utils/formatters';
import { useIsMobile } from '../hooks/useMediaQuery';

// Paleta monocromática fintech
const CHART_COLORS = [
  '#0A0A0A', '#1F2937', '#374151', '#4B5563',
  '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB'
];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { month, year } = getCurrentPeriod();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, categoryRes, trendRes, recentRes] = await Promise.all([
        reportsAPI.getSummary({ month, year }),
        reportsAPI.getByCategory({ month, year, type: 'expense' }),
        reportsAPI.getMonthlyTrend({ months: 6 }),
        reportsAPI.getRecent({ limit: 5 })
      ]);

      setSummary(summaryRes.data);
      setCategoryData(categoryRes.data || []);
      setTrendData(trendRes.data || []);
      setRecentTransactions(recentRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-10 w-48 shimmer rounded-xl" />
          <div className="h-5 w-32 shimmer rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 shimmer rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 shimmer rounded-2xl" />
          <div className="h-64 shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header - Hidden on mobile since balance card shows the date */}
      <div className="hidden sm:block">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Dashboard</h1>
        <p className="text-muted mt-1">{formatMonth(month, year)}</p>
      </div>

      {/* Stats Cards - Mobile optimized */}
      <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-5">
        {/* Balance */}
        <div className="relative overflow-hidden bg-gradient-balance text-white rounded-2xl p-4 sm:p-6 shadow-elevated">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative flex items-center justify-between sm:block">
            <div>
              <div className="flex items-center gap-2 mb-1 sm:mb-4">
                <Wallet size={16} className="opacity-80" />
                <span className="text-xs sm:text-sm font-medium opacity-80">Balance total</span>
              </div>
              <p className="text-2xl sm:text-4xl font-bold tabular-nums tracking-tight">
                {formatCompact(summary?.balance || 0)}
              </p>
            </div>
            <p className="text-xs opacity-60 sm:mt-2">{formatMonth(month, year)}</p>
          </div>
        </div>

        {/* Income & Expenses - Side by side on mobile */}
        <div className="grid grid-cols-2 gap-3 sm:contents">
          {/* Income */}
          <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-6 card-hover border border-border/50">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <div className="p-1.5 sm:p-2.5 bg-income/10 rounded-lg sm:rounded-xl">
                <TrendingUp size={14} className="sm:w-[18px] sm:h-[18px] text-income" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-muted">Ingresos</span>
            </div>
            <p className="text-lg sm:text-3xl font-bold text-primary tabular-nums tracking-tight">
              {formatCompact(summary?.income || 0)}
            </p>
            <p className="text-xs text-income flex items-center gap-1 mt-1 sm:mt-2">
              <ArrowUpRight size={12} />
              <span className="hidden sm:inline">{summary?.transaction_count || 0} transacciones</span>
              <span className="sm:hidden">{summary?.transaction_count || 0} tx</span>
            </p>
          </div>

          {/* Expenses */}
          <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-6 card-hover border border-border/50">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <div className="p-1.5 sm:p-2.5 bg-expense/10 rounded-lg sm:rounded-xl">
                <TrendingDown size={14} className="sm:w-[18px] sm:h-[18px] text-expense" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-muted">Gastos</span>
            </div>
            <p className="text-lg sm:text-3xl font-bold text-primary tabular-nums tracking-tight">
              {formatCompact(summary?.expenses || 0)}
            </p>
            <p className={`text-xs flex items-center gap-1 mt-1 sm:mt-2 ${
              summary?.expense_change > 0 ? 'text-expense' : 'text-income'
            }`}>
              {summary?.expense_change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span className="truncate">{formatPercentageChange(summary?.expense_change || 0)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Breakdown */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50">
          <h3 className="font-semibold text-primary text-base sm:text-lg tracking-tight mb-3 sm:mb-5">Gastos por categoría</h3>
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
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-4">
                  {categoryData.slice(0, 5).map((cat, index) => {
                    const percentage = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
                    return (
                      <div key={cat.id} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="text-sm text-secondary group-hover:text-primary transition-colors">
                              {cat.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-primary">
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
              <p>No hay gastos este mes</p>
            </div>
          )}
        </div>

        {/* Trend Chart */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50">
          <h3 className="font-semibold text-primary text-base sm:text-lg tracking-tight mb-3 sm:mb-5">Tendencia mensual</h3>
          {trendData.length > 0 ? (
            <div className={isMobile ? 'h-40' : 'h-44'}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A0A0A" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#0A0A0A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9CA3AF" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#9CA3AF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#A3A3A3' }}
                    tickFormatter={(value) => value.split('-')[1]}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A0A0A',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '12px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                    labelStyle={{ color: '#fff', marginBottom: '4px' }}
                    formatter={(value) => formatCOP(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#0A0A0A"
                    fill="url(#colorIncome)"
                    strokeWidth={2}
                    name="Ingresos"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#9CA3AF"
                    fill="url(#colorExpense)"
                    strokeWidth={2}
                    name="Gastos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-muted">
              <p>No hay datos suficientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50">
        <div className="flex items-center justify-between mb-3 sm:mb-5">
          <h3 className="font-semibold text-primary text-base sm:text-lg tracking-tight">Recientes</h3>
          <Link
            to="/transactions"
            className="text-xs sm:text-sm text-muted hover:text-primary flex items-center gap-1 transition-colors touch-feedback"
          >
            Ver todas
            <ChevronRight size={14} />
          </Link>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="space-y-1 sm:space-y-2">
            {recentTransactions.slice(0, isMobile ? 3 : 5).map((tx, index) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-black/[0.02] transition-colors animate-fadeIn list-item-touch"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg shadow-sm flex-shrink-0"
                  style={{ backgroundColor: `${tx.category_color}15` }}
                >
                  {tx.category_icon || (tx.type === 'income' ? '💰' : '📦')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary text-sm sm:text-base truncate">
                    {tx.description || tx.category_name || (tx.type === 'income' ? 'Ingreso' : 'Gasto')}
                  </p>
                  <p className="text-xs sm:text-sm text-muted truncate">
                    {tx.category_name} • {formatRelativeDate(tx.date)}
                  </p>
                </div>
                <p className={`font-semibold tabular-nums text-sm sm:text-lg flex-shrink-0 ${
                  tx.type === 'income' ? 'text-income' : 'text-expense'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCompact(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 sm:py-12 text-center">
            <p className="text-muted text-sm sm:text-base">No hay transacciones aún</p>
            <p className="text-xs sm:text-sm text-muted/70 mt-1">¡Agrega la primera!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
