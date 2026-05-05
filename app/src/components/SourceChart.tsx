import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import StatsCard from './StatsCard';
import { Separator } from '@/components/ui/separator';

const sourceData = [
  { name: 'CIPA',     value: 35, color: '#635BFF' },
  { name: 'BICA',     value: 22, color: '#00D4FF' },
  { name: 'BHPC',     value: 18, color: '#8b5cf6' },
  { name: 'LinkedIn', value: 15, color: '#f59e0b' },
  { name: 'Other',    value: 10, color: '#334a63'  },
];

const statusData = [
  { name: 'Verified', value: 68, color: '#635BFF' },
  { name: 'Pending',  value: 20, color: '#f59e0b' },
  { name: 'Drift',    value: 12, color: '#ef4444' },
];

function MiniDonut({ data: chartData }: { data: typeof sourceData }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%" cy="50%"
              innerRadius={34} outerRadius={50}
              dataKey="value"
              strokeWidth={2}
              stroke="hsl(210 66% 12%)"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-1.5 w-full">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-[11px] text-muted-foreground">{d.name}</span>
            </div>
            <span className="text-[11px] font-semibold text-foreground">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SourceChart() {
  return (
    <StatsCard title="Source & Status Distribution">
      <div className="flex items-start gap-4">
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Sources</p>
          <MiniDonut data={sourceData} />
        </div>
        <Separator orientation="vertical" className="self-stretch h-auto" />
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Status</p>
          <MiniDonut data={statusData} />
        </div>
      </div>
    </StatsCard>
  );
}
