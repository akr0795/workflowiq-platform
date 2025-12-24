import React from 'react';
import { cn } from '@/lib/utils';
import { KPIMetric } from '@/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  metric: KPIMetric;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const KPICard: React.FC<KPICardProps> = ({ metric, icon, className, style }) => {
  const getTrendIcon = () => {
    switch (metric.changeType) {
      case 'positive':
        return <TrendingUp className="w-4 h-4" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.changeType) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn('kpi-card', className)} style={style}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {metric.label}
          </p>
          <p className="text-3xl font-bold text-foreground">
            {metric.value.toLocaleString()}
            {metric.unit && <span className="text-lg ml-0.5">{metric.unit}</span>}
          </p>
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      
      <div className={cn('flex items-center gap-1 mt-3 text-sm', getTrendColor())}>
        {getTrendIcon()}
        <span className="font-medium">
          {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
        </span>
        <span className="text-muted-foreground">vs last month</span>
      </div>
    </div>
  );
};

export default KPICard;
