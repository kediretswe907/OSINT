import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  titleIcon?: React.ReactNode;
}

export default function StatsCard({ title, children, className = '', action, titleIcon }: StatsCardProps) {
  return (
    <Card className={cn('gap-0 overflow-hidden py-0 dash-card', className)}>
      <CardHeader className="px-5 py-3.5 border-b border-border/60 bg-white/[0.02] flex-row items-center justify-between space-y-0 gap-2">
        <CardTitle className="flex items-center gap-2 text-[13px] font-semibold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {titleIcon}
          {title}
        </CardTitle>
        {action && <div className="flex items-center gap-2 ml-auto">{action}</div>}
      </CardHeader>
      <CardContent className="p-5">
        {children}
      </CardContent>
    </Card>
  );
}
