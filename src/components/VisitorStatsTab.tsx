import React, { useState, useEffect } from 'react';
import { Users, Eye, TrendingUp, Calendar } from 'lucide-react';
import { getRecentStats, getTodayStats } from '../utils/analytics';

interface VisitorStats {
  date: string;
  uniqueVisitors: number;
  totalPageViews: number;
  newVisitors: number;
  returningVisitors: number;
}

const VisitorStatsTab: React.FC = () => {
  const [todayStats, setTodayStats] = useState<VisitorStats | null>(null);
  const [weekStats, setWeekStats] = useState<VisitorStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Обновляем каждые 30 секунд
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const [today, week] = await Promise.all([
        getTodayStats(),
        getRecentStats(7)
      ]);
      setTodayStats(today);
      setWeekStats(week);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const totalWeekVisitors = weekStats.reduce((sum, day) => sum + day.uniqueVisitors, 0);
  const totalWeekViews = weekStats.reduce((sum, day) => sum + day.totalPageViews, 0);
  const avgDailyVisitors = weekStats.length > 0 ? Math.round(totalWeekVisitors / weekStats.length) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Загрузка статистики...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика за сегодня */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Сегодня</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-5 h-5 text-blue-600" />}
            label="Уникальных посетителей"
            value={todayStats?.uniqueVisitors || 0}
            color="blue"
          />
          <StatCard
            icon={<Eye className="w-5 h-5 text-green-600" />}
            label="Просмотров страниц"
            value={todayStats?.totalPageViews || 0}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
            label="Новых посетителей"
            value={todayStats?.newVisitors || 0}
            color="purple"
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-orange-600" />}
            label="Вернулись"
            value={todayStats?.returningVisitors || 0}
            color="orange"
          />
        </div>
      </div>

      {/* Статистика за неделю */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">За последние 7 дней</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Всего посетителей</div>
            <div className="text-2xl font-bold text-slate-900">{totalWeekVisitors}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Всего просмотров</div>
            <div className="text-2xl font-bold text-slate-900">{totalWeekViews}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">В среднем за день</div>
            <div className="text-2xl font-bold text-slate-900">{avgDailyVisitors}</div>
          </div>
        </div>

        {/* График */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-900">Посещаемость по дням</h4>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          
          {weekStats.length > 0 ? (
            <div className="space-y-3">
              {weekStats.reverse().map((day, index) => {
                const maxVisitors = Math.max(...weekStats.map(d => d.uniqueVisitors));
                const barWidth = maxVisitors > 0 ? (day.uniqueVisitors / maxVisitors) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-medium">{formatDate(day.date)}</span>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>👥 {day.uniqueVisitors}</span>
                        <span>👁️ {day.totalPageViews}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Нет данных за последние 7 дней
            </div>
          )}
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">ℹ️</div>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">О статистике</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Уникальные посетители определяются по ID браузера</li>
              <li>• Новые посетители - те, кто зашел впервые</li>
              <li>• Данные обновляются каждые 30 секунд</li>
              <li>• История хранится в Firebase Firestore</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
};

export default VisitorStatsTab;
