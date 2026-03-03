import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  loading?: boolean;
}

const colors = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
};

export default function StatCard({ title, value, icon: Icon, trend, color = 'blue', loading }: Props) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-4 w-24 mb-3" />
        <div className="skeleton h-8 w-16 mb-2" />
        <div className="skeleton h-3 w-32" />
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {trend && (
            <p className={clsx('mt-1 text-xs font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-500')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={clsx('p-2.5 rounded-xl flex-shrink-0', colors[color])}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
