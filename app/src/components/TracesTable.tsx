import StatsCard from './StatsCard';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';

interface Trace {
  id: number;
  subject: string;
  sources: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  drift: boolean;
  date: string;
}

const mockTraces: Trace[] = [
  { id: 1, subject: 'Joy Lethabo',       sources: 'CIPA, LinkedIn', confidence: 'HIGH',   drift: false, date: '2026-04-27' },
  { id: 2, subject: 'Thabo Mogale',      sources: 'BICA, BHPC',     confidence: 'MEDIUM', drift: true,  date: '2026-04-26' },
  { id: 3, subject: 'Naledi Sekgabo',    sources: 'CIPA',           confidence: 'LOW',    drift: false, date: '2026-04-25' },
  { id: 4, subject: 'Kagiso Moeti',      sources: 'LinkedIn, CIPA', confidence: 'HIGH',   drift: false, date: '2026-04-24' },
  { id: 5, subject: 'Mpho Tshegofatso', sources: 'BHPC',           confidence: 'MEDIUM', drift: true,  date: '2026-04-23' },
];

const confClass: Record<Trace['confidence'], string> = {
  HIGH:   'bg-indigo-500/25 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/35',
  MEDIUM: 'bg-amber-500/25 text-amber-300 border-amber-500/40 hover:bg-amber-500/35',
  LOW:    'bg-red-500/25 text-red-300 border-red-500/40 hover:bg-red-500/35',
};

export default function TracesTable() {
  return (
    <StatsCard title="Recent Traces" className="col-span-full">
      <Table>
        <TableHeader>
          <TableRow className="border-border/40 hover:bg-transparent">
            <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider h-9">Subject</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider h-9">Sources</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider h-9">Confidence</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider h-9">Drift</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider h-9">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTraces.map((t) => (
            <TableRow key={t.id} className="border-border/30 hover:bg-white/[0.025] transition-colors">
              <TableCell className="py-3 font-medium text-foreground">{t.subject}</TableCell>
              <TableCell className="py-3 text-muted-foreground text-sm">{t.sources}</TableCell>
              <TableCell className="py-3">
                <Badge variant="outline" className={`text-[10px] font-semibold tracking-widest uppercase rounded-md px-2 py-0.5 ${confClass[t.confidence]}`}>
                  {t.confidence}
                </Badge>
              </TableCell>
              <TableCell className="py-3">
                {t.drift ? (
                  <Badge variant="outline" className="text-[10px] font-semibold bg-red-500/10 text-red-400 border-red-500/20 gap-1 rounded-md px-2 py-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" /> Drift
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
              <TableCell className="py-3 text-muted-foreground text-xs">{t.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </StatsCard>
  );
}
