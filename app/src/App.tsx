import { useState, useRef, useEffect } from 'react';
import { Terminal, Search, AlertTriangle, Activity, Database, Globe, User, Shield, CheckCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

// Helper to render complex JSON objects nicely
const JsonViewer = ({ data }: { data: any }) => {
  if (typeof data !== 'object' || data === null) {
    return <span className="text-zinc-300">{String(data)}</span>;
  }

  if (Array.isArray(data)) {
    return (
      <ul className="list-disc list-inside text-zinc-300 ml-2 space-y-1">
        {data.map((item, i) => (
          <li key={i}><JsonViewer data={item} /></li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-1 mt-1">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="pl-3 border-l border-zinc-800">
          <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{key.replace(/_/g, ' ')}: </span>
          <JsonViewer data={value} />
        </div>
      ))}
    </div>
  );
};

function App() {
  const defaultWebhookUrl =
    (import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined)?.trim() || '/api/osint';
  const [name, setName] = useState('');
  const [courseOfStudy, setCourseOfStudy] = useState('');
  const [yearOfCommencement, setYearOfCommencement] = useState('');
  const [institution, setInstitution] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(defaultWebhookUrl);
  const [isScanning, setIsScanning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [result, setResult] = useState<OSINTResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: logIdRef.current++,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type,
      message
    };
    setLogs(prev => [...prev, newLog]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    addLog('DTEF OSINT DEBTOR TRACER v2.4.1 initialized', 'system');
    addLog('Awaiting search parameters...', 'info');
  }, []);

  const initiateScan = async () => {
    if (!name.trim()) {
      addLog('ERROR: Target identifier (Name) required', 'error');
      return;
    }

    setIsScanning(true);
    setResult(null);
    setLogs([]);

    addLog(`TARGET ACQUISITION INITIATED`, 'system');
    addLog(`Subject: ${name}`, 'info');
    addLog(`Course of Study: ${courseOfStudy || 'N/A'}`, 'info');
    addLog(`Year of Commencement: ${yearOfCommencement || 'N/A'}`, 'info');
    addLog(`Institution: ${institution || 'N/A'}`, 'info');

    try {
      addLog('Initiating search sequence...', 'info');
      await new Promise(r => setTimeout(r, 800));
      
      const payload = {
        chatInput: `Name: ${name}\nCourse of Study: ${courseOfStudy}\nYear of Commencement: ${yearOfCommencement}\nInstitution: ${institution}`
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      addLog('Search complete. Data retrieved successfully', 'success');
      const data = await response.json();
      
      // Dump raw n8n output to log
      addLog('--- RAW N8N OUTPUT ---', 'system');
      const rawLines = JSON.stringify(data, null, 2).split('\n');
      rawLines.forEach(line => addLog(line, 'system'));

      let parsedResult: OSINTResult = {};
      
      if (Array.isArray(data) && data[0] && data[0].structured) {
        parsedResult = data[0].structured;
      } else if (data.structured) {
        parsedResult = data.structured;
      } else if (typeof data === 'string') {
        try {
          parsedResult = JSON.parse(data);
        } catch {
          parsedResult = { reasoning: data };
        }
      } else if (data.text) {
        try {
          parsedResult = JSON.parse(data.text);
        } catch {
          parsedResult = { raw_output: data.text, full_data: data };
        }
      } else {
        parsedResult = data;
      }

      setResult(parsedResult);

      if (parsedResult.confidence) {
        const confColor = parsedResult.confidence === 'HIGH' ? 'success' : 
                         parsedResult.confidence === 'MEDIUM' ? 'warning' : 'error';
        addLog(`CONFIDENCE LEVEL: ${parsedResult.confidence}`, confColor as LogEntry['type']);
      }
      if (parsedResult.drift_warning) {
        addLog('DRIFT WARNING: Identity mismatch detected', 'error');
      }

      addLog('ACQUISITION COMPLETE', 'success');

    } catch (error) {
      addLog(`CONNECTION FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const getConfidenceColor = (confidence?: string) => {
    switch (confidence?.toUpperCase()) {
      case 'HIGH': return 'text-zinc-100 bg-zinc-800 border-zinc-700';
      case 'MEDIUM': return 'text-zinc-300 bg-zinc-800/50 border-zinc-700/50';
      case 'LOW': return 'text-zinc-400 bg-zinc-900 border-zinc-800';
      default: return 'text-zinc-500 bg-zinc-900 border-zinc-800';
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 selection:bg-zinc-800">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Search className="w-4 h-4 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-white">
                  DTEF OSINT TRACER
                </h1>
                <p className="text-xs text-zinc-500 font-medium tracking-wide">ENTERPRISE INTELLIGENCE SYSTEM v2.4.1</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span className="text-zinc-300 text-xs">SYSTEM ONLINE</span>
              </div>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Warning Banner */}
        <div className="mb-8 border border-zinc-800 bg-zinc-900/50 rounded-xl p-4 flex items-start gap-4">
          <div className="mt-0.5">
            <AlertTriangle className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <p className="text-zinc-200 font-medium text-sm">RESTRICTED ACCESS</p>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              This system accesses sensitive databases. All queries are logged and monitored. 
              Unauthorized access is strictly prohibited and subject to legal action.
            </p>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8 border border-zinc-800 bg-zinc-950 rounded-xl p-5 animate-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-medium flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4 text-zinc-400" />
                SYSTEM CONFIGURATION
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-zinc-500 hover:text-white transition-colors text-xs font-medium"
              >
                CLOSE
              </button>
            </div>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label className="text-zinc-400 text-xs mb-2 block font-medium">ENDPOINT URL</Label>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-n8n-instance.com/webhook/osint"
                  className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 focus:border-zinc-500 focus:ring-0 transition-all rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-zinc-800 bg-black rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-white mb-1">Target Acquisition</h2>
                  <p className="text-xs text-zinc-500">Enter known subject parameters</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-medium flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      FULL NAME
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Joy Lethabo"
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 focus:border-zinc-500 focus:ring-0 rounded-lg h-11"
                      disabled={isScanning}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-medium flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" />
                      COURSE OF STUDY
                    </Label>
                    <Input
                      value={courseOfStudy}
                      onChange={(e) => setCourseOfStudy(e.target.value)}
                      placeholder="e.g. Bachelor of Accountancy"
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 focus:border-zinc-500 focus:ring-0 rounded-lg h-11"
                      disabled={isScanning}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-medium flex items-center gap-2">
                      <Database className="w-3.5 h-3.5" />
                      YEAR OF COMMENCEMENT
                    </Label>
                    <Input
                      value={yearOfCommencement}
                      onChange={(e) => setYearOfCommencement(e.target.value)}
                      placeholder="e.g. 2018"
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 focus:border-zinc-500 focus:ring-0 rounded-lg h-11"
                      disabled={isScanning}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-medium flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" />
                      INSTITUTION
                    </Label>
                    <Input
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. University of Botswana"
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 focus:border-zinc-500 focus:ring-0 rounded-lg h-11"
                      disabled={isScanning}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={initiateScan}
                    disabled={isScanning}
                    className="w-full bg-white text-black hover:bg-zinc-200 h-12 rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    {isScanning ? (
                      <span className="flex items-center justify-center gap-2">
                        <Activity className="w-4 h-4 animate-spin" />
                        PROCESSING TARGET
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Search className="w-4 h-4" />
                        INITIATE SCAN
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results & Logs */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Results Panel */}
            {result && (
              <div className="border border-zinc-800 bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl animate-in">
                <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between bg-black/50">
                  <span className="text-white text-sm font-medium flex items-center gap-2">
                    <Database className="w-4 h-4 text-zinc-400" />
                    INTELLIGENCE REPORT
                  </span>
                  {result.confidence && (
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium tracking-wide uppercase ${getConfidenceColor(result.confidence)}`}>
                      {result.confidence} CONFIDENCE
                    </span>
                  )}
                </div>
                
                <div className="p-6">
                  {/* Warnings Row */}
                  {(result.drift_warning || result.action_required) && (
                    <div className="flex flex-col gap-3 mb-6">
                      {result.drift_warning && (
                        <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-700 bg-zinc-800/30">
                          <AlertTriangle className="w-4 h-4 text-zinc-300 mt-0.5" />
                          <div>
                            <p className="text-white text-sm font-medium">Identity Drift Detected</p>
                            <p className="text-zinc-400 text-xs mt-1">Matched names do not precisely equal the target. Results may be unreliable.</p>
                          </div>
                        </div>
                      )}
                      {result.action_required && (
                        <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                          <CheckCircle className="w-4 h-4 text-zinc-400 mt-0.5" />
                          <div>
                            <p className="text-white text-sm font-medium">Manual Verification Required</p>
                            <p className="text-zinc-500 text-xs mt-1">Please manually review the sources before taking action.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dynamic Data Render */}
                  <div className="space-y-6">
                    {Object.entries(result).filter(([k]) => !['confidence', 'drift_warning', 'action_required'].includes(k)).length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {Object.entries(result)
                          .filter(([k]) => !['confidence', 'drift_warning', 'action_required'].includes(k))
                          .map(([key, value]) => {
                            // Format scalar values nicely
                            const isObject = typeof value === 'object' && value !== null;
                            return (
                              <div key={key} className="flex flex-col gap-1.5">
                                <span className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">
                                  {key.replace(/_/g, ' ')}
                                </span>
                                {isObject ? (
                                  <div className="bg-black border border-zinc-800/50 rounded-lg p-4 mt-1 overflow-x-auto text-sm">
                                    <JsonViewer data={value} />
                                  </div>
                                ) : (
                                  <div className="text-zinc-200 text-sm bg-zinc-900/30 border border-zinc-800/30 rounded-lg p-3">
                                    {String(value)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-zinc-500 text-sm">
                        No additional data points returned in the payload.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Terminal Log */}
            <div className={`border border-zinc-800 bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-500 ${result ? 'h-[300px]' : 'h-[600px]'}`}>
              <div className="px-5 py-3 border-b border-zinc-900 flex items-center justify-between">
                <span className="text-zinc-400 text-xs font-medium flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  SYSTEM LOG
                </span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                </div>
              </div>
              
              <div className="flex-1 p-5 overflow-y-auto font-mono text-[13px] space-y-2">
                {logs.length === 0 ? (
                  <p className="text-zinc-700">Waiting for input...</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex gap-3 leading-relaxed">
                      <span className="text-zinc-600 flex-shrink-0 whitespace-nowrap">[{log.timestamp}]</span>
                      <span className={`break-all
                        ${log.type === 'error' ? 'text-zinc-100 font-medium' : ''}
                        ${log.type === 'warning' ? 'text-zinc-300' : ''}
                        ${log.type === 'success' ? 'text-white font-medium' : ''}
                        ${log.type === 'system' ? 'text-zinc-500' : ''}
                        ${log.type === 'info' ? 'text-zinc-400' : ''}
                      `}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
                {isScanning && (
                  <div className="flex gap-3 text-zinc-500">
                    <span className="flex-shrink-0 whitespace-nowrap">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                    <span className="animate-pulse">Still searching...</span>
                  </div>
                )}
                <div ref={logsEndRef} />
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center pb-8">
          <p className="text-zinc-600 text-xs font-medium tracking-wide">
            ENTERPRISE INTELLIGENCE SYSTEM &copy; {new Date().getFullYear()}
          </p>
          <p className="text-zinc-700 text-[10px] mt-2 font-mono">
            SESSION: {Math.random().toString(36).substring(2, 10).toUpperCase()}
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
