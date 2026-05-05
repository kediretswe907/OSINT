import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import StatsCard from './StatsCard';
import { Progress } from '@/components/ui/progress';

const data = [
  { name: 'High',   value: 62, color: '#635BFF', progressClass: '[&>div]:bg-primary' },
  { name: 'Medium', value: 25, color: '#f59e0b', progressClass: '[&>div]:bg-amber-500' },
  { name: 'Low',    value: 13, color: '#ef4444', progressClass: '[&>div]:bg-red-500' },
];

export default function ConfidenceChart() {
  return (
    <StatsCard title="Confidence Overview">
      <div className="flex items-center gap-6">
        {/* Donut chart */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius={42} outerRadius={62}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(210 66% 12%)"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-foreground">62%</span>
            <span className="text-[10px] text-muted-foreground">High Conf.</span>
          </div>
        </div>

        {/* Progress bars */}
        <div className="flex-1 space-y-3.5">
          {data.map((d) => (
            <div key={d.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ background: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-foreground">{d.value}%</span>
              </div>
              <Progress
                value={d.value}
                className={`h-2 bg-white/10 ${d.progressClass}`}
              />
            </div>
          ))}
        </div>
      </div>
    </StatsCard>
  );
}
