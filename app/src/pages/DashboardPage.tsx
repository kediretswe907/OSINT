import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, AlertTriangle, Activity, Database, User,
  Settings, Terminal, LayoutDashboard, Clock, FileText, Zap, TrendingUp, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ConfidenceChart from '@/components/ConfidenceChart';
import SourceChart from '@/components/SourceChart';
import TracesTable from '@/components/TracesTable';

interface OSINTResult {
  confidence?: string;
  drift_warning?: boolean;
  action_required?: boolean;
  [key: string]: any;
}

interface LogEntry {
  id: number;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  message: string;
}

const JsonViewer = ({ data }: { data: any }) => {
  if (typeof data !== 'object' || data === null) return <span style={{ color: '#c7d2fe' }}>{String(data)}</span>;
  if (Array.isArray(data)) return (
    <ul className="list-disc list-inside ml-2 space-y-1 text-indigo-200">
      {data.map((item, i) => <li key={i}><JsonViewer data={item} /></li>)}
    </ul>
  );
  return (
    <div className="space-y-1 mt-1">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="pl-3 border-l border-border">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{key.replace(/_/g, ' ')}: </span>
          <JsonViewer data={value} />
        </div>
      ))}
    </div>
  );
};

const LOG_CHIP: Record<LogEntry['type'], { label: string; className: string; textClass: string }> = {
  system:  { label: 'SYS', className: 'bg-white/[0.06]',      textClass: 'text-muted-foreground' },
  info:    { label: 'INF', className: 'bg-blue-500/10',        textClass: 'text-blue-300' },
  success: { label: 'OK',  className: 'bg-primary/10',         textClass: 'text-indigo-300' },
  warning: { label: 'WRN', className: 'bg-amber-500/10',       textClass: 'text-amber-400' },
  error:   { label: 'ERR', className: 'bg-red-500/10',         textClass: 'text-red-400' },
};

const CONF_BADGE: Record<string, string> = {
  HIGH:    'bg-primary/10 text-indigo-300 border-primary/30',
  MEDIUM:  'bg-amber-500/10 text-amber-400 border-amber-500/25',
  LOW:     'bg-red-500/10 text-red-400 border-red-500/25',
  DEFAULT: 'bg-white/[0.05] text-muted-foreground border-white/10',
};

const HIDDEN_KEYS = ['confidence','drift_warning','action_required','best_source','sources_matched','name_found_in_sources','inference_chain','output','debug','reasoning'];

function EmptyTab({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-border flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const defaultWebhookUrl = (import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined)?.trim() || '/api/osint';
  const [name, setName] = useState('');
  const [courseOfStudy, setCourseOfStudy] = useState('');
  const [yearOfCommencement, setYearOfCommencement] = useState('');
  const [institution, setInstitution] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(defaultWebhookUrl);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<OSINTResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);

  const addLog = (message: string, type: LogEntry['type'] = 'info') =>
    setLogs(prev => [...prev, { id: logIdRef.current++, timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }), type, message }]);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
  useEffect(() => { addLog('System ready', 'system'); addLog('Enter search parameters to begin.', 'info'); }, []);

  const initiateScan = async () => {
    if (!name.trim()) { addLog('Name is required.', 'error'); return; }
    setIsScanning(true); setResult(null); setLogs([]);
    addLog('Search started', 'system');
    addLog(`Name: ${name}`, 'info');
    if (courseOfStudy) addLog(`Course: ${courseOfStudy}`, 'info');
    if (yearOfCommencement) addLog(`Year: ${yearOfCommencement}`, 'info');
    if (institution) addLog(`Institution: ${institution}`, 'info');
    try {
      addLog('Querying registries...', 'info');
      await new Promise(r => setTimeout(r, 800));
      const payload = { chatInput: `Name: ${name}\nCourse of Study: ${courseOfStudy}\nYear of Commencement: ${yearOfCommencement}\nInstitution: ${institution}` };
      const response = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      addLog('Data retrieved successfully.', 'success');
      const data = await response.json();
      let parsedResult: OSINTResult = {};
      if (Array.isArray(data) && data[0]?.structured) parsedResult = data[0].structured;
      else if (data.structured) parsedResult = data.structured;
      else if (typeof data === 'string') { try { parsedResult = JSON.parse(data); } catch { parsedResult = { reasoning: data }; } }
      else if (data.text) { try { parsedResult = JSON.parse(data.text); } catch { parsedResult = { raw_output: data.text }; } }
      else parsedResult = data;
      setResult(parsedResult);
      if (parsedResult.confidence) {
        const t = parsedResult.confidence === 'HIGH' ? 'success' : parsedResult.confidence === 'MEDIUM' ? 'warning' : 'error';
        addLog(`Confidence: ${parsedResult.confidence}`, t as LogEntry['type']);
      }
      if (parsedResult.drift_warning) addLog('Drift warning — identity mismatch detected.', 'warning');
      addLog('Search complete.', 'success');
    } catch (error) {
      addLog(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally { setIsScanning(false); }
  };

  const confBadgeClass = (c?: string) => CONF_BADGE[c?.toUpperCase() ?? ''] ?? CONF_BADGE.DEFAULT;

  return (
    <div className="min-h-screen" style={{ background: '#0c1c30', color: '#eef4fd' }}>
      <Tabs defaultValue="dashboard" className="flex flex-col min-h-screen">

        {/* ── TOP NAV ── */}
        <header className="sticky top-0 z-50" style={{ background: 'rgba(12,28,48,0.94)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
          <div className="px-6 py-2.5 flex items-center justify-between gap-4">
            {/* Left: logo + tabs */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                <div className="w-7 h-7 rounded-md flex items-center justify-center transition-all group-hover:shadow-[0_0_14px_rgba(99,91,255,0.5)]" style={{ background: 'linear-gradient(135deg,#5850EC,#635BFF)' }}>
                  <Search className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[15px] font-bold hidden sm:inline" style={{ fontFamily: 'Outfit,sans-serif', letterSpacing: '-0.03em', color: '#eef4fd' }}>
                  FABLE<span className="text-gradient">SINT</span>
                </span>
              </Link>
              <Separator orientation="vertical" className="h-5 hidden md:block" />
              <TabsList className="hidden md:inline-flex bg-white/[0.04] border border-white/[0.08] h-8 p-0.5 gap-0.5">
                <TabsTrigger value="dashboard" className="h-7 px-3 text-[13px] gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-indigo-300 data-[state=active]:border-primary/30 data-[state=active]:shadow-none text-muted-foreground">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </TabsTrigger>
                <TabsTrigger value="history" className="h-7 px-3 text-[13px] gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-indigo-300 data-[state=active]:shadow-none text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> History
                </TabsTrigger>
                <TabsTrigger value="reports" className="h-7 px-3 text-[13px] gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-indigo-300 data-[state=active]:shadow-none text-muted-foreground">
                  <FileText className="w-3.5 h-3.5" /> Reports
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Right: live indicator + settings + user */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium" style={{ background: 'rgba(99,91,255,0.1)', border: '1px solid rgba(99,91,255,0.22)', color: '#a5b4fc' }}>
                <span className="pulse-dot" style={{ width:'5px', height:'5px', background:'#635BFF' }} /> Live
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-white/[0.06]">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Settings</TooltipContent>
                  </Tooltip>
                </SheetTrigger>
                <SheetContent side="right" className="w-[360px] bg-card border-border">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-foreground" style={{ fontFamily: 'Outfit,sans-serif' }}>
                      <Settings className="w-4 h-4 text-muted-foreground" /> Configuration
                    </SheetTitle>
                    <SheetDescription>Configure your n8n webhook endpoint.</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-3 px-1">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Webhook Endpoint</Label>
                    <Input
                      value={webhookUrl}
                      onChange={e => setWebhookUrl(e.target.value)}
                      placeholder="https://your-n8n-instance.com/webhook/osint"
                      className="text-sm h-9 bg-background border-border text-foreground placeholder:text-muted-foreground/30"
                    />
                    <p className="text-xs text-muted-foreground">The n8n webhook URL that receives search payloads.</p>
                  </div>
                </SheetContent>
              </Sheet>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: 'rgba(99,91,255,0.12)', border: '1px solid rgba(99,91,255,0.25)' }}>
                    <User className="w-3.5 h-3.5" style={{ color: '#818CF8' }} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">Account</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* ── TAB CONTENTS ── */}
        <div className="flex-1 px-6 py-7 max-w-[1400px] mx-auto w-full">

          <TabsContent value="dashboard" className="mt-0">
            {/* Page header */}
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: 'Outfit,sans-serif', letterSpacing: '-0.02em', color: '#eef4fd' }}>Trace Dashboard</h1>
                <p className="text-[13px] mt-0.5 text-muted-foreground">Search and verify subject records across Botswana registries.</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span>6 sources active</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Row 1: Search + Confidence */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Search form */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
                  <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid #635BFF', paddingLeft: '1.125rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                      <span className="text-[13px] font-semibold" style={{ fontFamily: 'Outfit,sans-serif', color: '#eef4fd' }}>New Trace</span>
                      <p className="text-[11px] mt-0.5 text-muted-foreground">Enter known subject details to run a registry search</p>
                    </div>
                    <Zap className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Full Name <span className="text-red-400">*</span>
                      </Label>
                      <Input id="search-name" value={name} onChange={e => setName(e.target.value)}
                        placeholder="e.g. Joy Lethabo" disabled={isScanning}
                        className="h-9 text-sm rounded-lg placeholder:text-muted-foreground/30 bg-background border-border text-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Course of Study</Label>
                      <Input id="search-course" value={courseOfStudy} onChange={e => setCourseOfStudy(e.target.value)}
                        placeholder="e.g. Bachelor of Accountancy" disabled={isScanning}
                        className="h-9 text-sm rounded-lg placeholder:text-muted-foreground/30 bg-background border-border text-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Year</Label>
                        <Input id="search-year" value={yearOfCommencement} onChange={e => setYearOfCommencement(e.target.value)}
                          placeholder="e.g. 2018" disabled={isScanning}
                          className="h-9 text-sm rounded-lg placeholder:text-muted-foreground/30 bg-background border-border text-foreground" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Institution</Label>
                        <Input id="search-institution" value={institution} onChange={e => setInstitution(e.target.value)}
                          placeholder="e.g. UB" disabled={isScanning}
                          className="h-9 text-sm rounded-lg placeholder:text-muted-foreground/30 bg-background border-border text-foreground" />
                      </div>
                    </div>
                    <Button id="run-trace-btn" onClick={initiateScan} disabled={isScanning}
                      className="w-full h-10 rounded-lg font-semibold text-sm text-white border-0 disabled:opacity-50 transition-all duration-200"
                      style={{ background: 'linear-gradient(135deg,#5850EC,#635BFF 50%,#7A73FF)', boxShadow: isScanning ? 'none' : '0 0 24px rgba(99,91,255,0.28)' }}>
                      {isScanning
                        ? <span className="flex items-center justify-center gap-2"><Activity className="w-4 h-4 animate-spin" />Searching registries...</span>
                        : <span className="flex items-center justify-center gap-2"><Search className="w-4 h-4" />Run Trace</span>}
                    </Button>
                  </div>
                </div>
                <ConfidenceChart />
              </div>

              {/* Row 2: Source + Traces */}
              <div className="grid lg:grid-cols-[1fr_1.5fr] gap-4">
                <SourceChart />
                <TracesTable />
              </div>

              {/* Row 3: Results */}
              {result && (() => {
                const entries = Object.entries(result).filter(([k]) => !HIDDEN_KEYS.includes(k));
                return (
                  <div className="rounded-xl overflow-hidden animate-in" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
                    <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                      <span className="flex items-center gap-2 text-[13px] font-semibold text-foreground" style={{ fontFamily: 'Outfit,sans-serif' }}>
                        <Database className="w-3.5 h-3.5 text-muted-foreground" /> Intelligence Report
                      </span>
                      {result.confidence && (
                        <Badge variant="outline" className={`text-[10px] font-bold tracking-widest uppercase rounded-md px-2.5 py-1 gap-1.5 ${confBadgeClass(result.confidence)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {result.confidence}
                        </Badge>
                      )}
                    </div>
                    <div className="p-5 space-y-4">
                      {(result.drift_warning || result.action_required) && (
                        <div className="flex flex-col gap-2">
                          {result.drift_warning && (
                            <Alert className="border-amber-500/20 bg-amber-500/[0.06] text-amber-400">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle className="text-white font-semibold">Identity Drift Detected</AlertTitle>
                              <AlertDescription className="text-muted-foreground">Matched names do not precisely equal the target.</AlertDescription>
                            </Alert>
                          )}
                          {result.action_required && (
                            <Alert className="border-border bg-white/[0.02]">
                              <CheckCircle className="h-4 w-4 text-muted-foreground" />
                              <AlertTitle className="text-white font-semibold">Manual Verification Required</AlertTitle>
                              <AlertDescription>Review sources before taking action.</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                      {entries.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {entries.map(([key, value]) => (
                            <div key={key} className="rounded-lg overflow-hidden border border-border">
                              <div className="px-3 py-1.5 bg-white/[0.03] border-b border-border/60">
                                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                              </div>
                              <div className="p-3 text-sm text-indigo-200">
                                {typeof value === 'object' && value !== null ? <JsonViewer data={value} /> : String(value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-center py-8 text-sm text-muted-foreground">No additional data.</p>}
                    </div>
                  </div>
                );
              })()}

              {/* Row 4: Activity Log */}
              <div className={`rounded-xl overflow-hidden flex flex-col ${result ? 'h-[200px]' : 'h-[280px]'}`} style={{ background: '#08111f', border: '1px solid #1e3a57' }}>
                <div className="px-5 py-3 flex items-center justify-between flex-shrink-0 border-b border-white/[0.05]">
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Terminal className="w-3.5 h-3.5" /> Activity Log
                  </span>
                  {isScanning && (
                    <span className="flex items-center gap-1.5 text-[11px] text-indigo-300">
                      <Activity className="w-3 h-3 animate-spin" /> Running
                    </span>
                  )}
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 font-mono text-[12px] space-y-1.5 select-none">
                    {logs.length === 0
                      ? <p className="italic text-muted-foreground/40">Waiting for input...</p>
                      : logs.map(log => {
                        const chip = LOG_CHIP[log.type];
                        return (
                          <div key={log.id} className="flex items-start gap-3 leading-relaxed">
                            <span className="flex-shrink-0 whitespace-nowrap pt-0.5 text-[10px] text-muted-foreground/40">{log.timestamp}</span>
                            <span className={`log-chip flex-shrink-0 ${chip.className} ${chip.textClass}`}>{chip.label}</span>
                            <span className={`break-all ${chip.textClass}`}>{log.message}</span>
                          </div>
                        );
                      })}
                    {isScanning && (
                      <div className="flex items-start gap-3">
                        <span className="text-[10px] pt-0.5 text-muted-foreground/40">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                        <span className="log-chip bg-blue-500/10 text-blue-300">INF</span>
                        <span className="animate-pulse text-indigo-300/50">Searching...</span>
                      </div>
                    )}
                    <div ref={logsEndRef} />
                  </div>
                </ScrollArea>
              </div>
            </div>

            <footer className="mt-8 pb-6 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} Afrifable</p>
              <Link to="/" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">← Back to landing</Link>
            </footer>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <EmptyTab icon={Clock} label="No trace history yet. Run your first trace to see results here." />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <EmptyTab icon={FileText} label="No reports generated yet. Complete a trace to generate a report." />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
