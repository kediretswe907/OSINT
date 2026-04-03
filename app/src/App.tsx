import { useState, useRef, useEffect } from 'react';
import { Terminal, Search, AlertTriangle, Activity, Database, Globe, User, Shield, Cpu, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OSINTResult {
  best_employer?: string;
  best_title?: string;
  confidence?: string;
  location?: string;
  sources_matched?: number;
  best_source?: string;
  reasoning?: string;
  drift_warning?: boolean;
  action_required?: boolean;
  name_found_in_sources?: string[];
}

interface LogEntry {
  id: number;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  message: string;
}

function App() {
  const defaultWebhookUrl =
    (import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined)?.trim() || '/api/osint';
  const [name, setName] = useState('');
  const [omang, setOmang] = useState('');
  const [degree, setDegree] = useState('');
  const [location, setLocation] = useState('Botswana');
  const [webhookUrl, setWebhookUrl] = useState(defaultWebhookUrl);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<OSINTResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showSettings, setShowSettings] = useState(false);
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
    // Initial system logs
    addLog('DTEF OSINT DEBTOR TRACER v2.4.1 initialized', 'system');
    addLog('Connection status: STANDBY', 'warning');
    if (defaultWebhookUrl === '/api/osint') {
      addLog('Configure webhook URL to begin operations', 'info');
    } else {
      addLog('Webhook URL loaded from environment configuration', 'success');
    }
  }, []);

  const initiateScan = async () => {
    if (!webhookUrl) {
      addLog('ERROR: Webhook URL not configured', 'error');
      setShowSettings(true);
      return;
    }

    if (!name.trim()) {
      addLog('ERROR: Target identifier (Name) required', 'error');
      return;
    }

    setIsScanning(true);
    setResult(null);
    setLogs([]);

    addLog(`TARGET ACQUISITION INITIATED`, 'system');
    addLog(`Subject: ${name}`, 'info');
    addLog(`National ID: ${omang || 'N/A'}`, 'info');
    addLog(`Degree Profile: ${degree || 'N/A'}`, 'info');
    addLog(`Geofence: ${location}`, 'info');
    addLog('----------------------------------------', 'system');

    try {
      addLog('Establishing secure connection...', 'info');
      await new Promise(r => setTimeout(r, 800));
      
      addLog('Handshake successful. Encrypting payload...', 'success');
      await new Promise(r => setTimeout(r, 600));

      addLog('Transmitting OSINT vectors to remote node...', 'info');
      
      const payload = {
        chatInput: `Name: ${name}\nOmang: ${omang}\nDegree: ${degree}\nLastKnownLocation: ${location}`
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

      addLog('Response received. Decrypting...', 'success');
      await new Promise(r => setTimeout(r, 500));

      const data = await response.json();
      addLog('Data parsed successfully', 'success');
      addLog('----------------------------------------', 'system');

      // Parse the response - it might be in different formats
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
          parsedResult = { reasoning: data.text };
        }
      } else {
        parsedResult = data;
      }

      setResult(parsedResult);

      // Log results
      if (parsedResult.best_employer) {
        addLog(`EMPLOYER IDENTIFIED: ${parsedResult.best_employer}`, 'success');
      }
      if (parsedResult.best_title) {
        addLog(`TITLE: ${parsedResult.best_title}`, 'info');
      }
      if (parsedResult.confidence) {
        const confColor = parsedResult.confidence === 'HIGH' ? 'success' : 
                         parsedResult.confidence === 'MEDIUM' ? 'warning' : 'error';
        addLog(`CONFIDENCE LEVEL: ${parsedResult.confidence}`, confColor as LogEntry['type']);
      }
      if (parsedResult.drift_warning) {
        addLog('⚠️ DRIFT WARNING: Identity mismatch detected', 'error');
      }
      if (parsedResult.sources_matched !== undefined) {
        addLog(`Sources analyzed: ${parsedResult.sources_matched}`, 'info');
      }

      addLog('----------------------------------------', 'system');
      addLog('ACQUISITION COMPLETE', 'success');

    } catch (error) {
      addLog(`CONNECTION FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      addLog('Check webhook URL and network connectivity', 'warning');
    } finally {
      setIsScanning(false);
    }
  };

  const getConfidenceColor = (confidence?: string) => {
    switch (confidence) {
      case 'HIGH': return 'text-green-400 glow-text';
      case 'MEDIUM': return 'text-yellow-400';
      case 'LOW': return 'text-orange-400';
      default: return 'text-red-400';
    }
  };

  const getConfidenceIcon = (confidence?: string) => {
    switch (confidence) {
      case 'HIGH': return '🟢';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟠';
      default: return '🔴';
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono scanline matrix-bg">
      {/* Header */}
      <header className="border-b border-green-900/50 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-6 h-6 text-green-400" />
              <div>
                <h1 className="text-xl font-bold tracking-wider glow-text">
                  <span className="text-green-500">{'>'}</span> DTEF_OSINT_TRACER
                </h1>
                <p className="text-xs text-green-600">[CLASSIFIED] Debtor Intelligence Aggregation System v2.4.1</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 pulse-status"></span>
                <span className="text-green-400">SYSTEM ONLINE</span>
              </div>
              <span className="text-green-600">{new Date().toISOString().split('T')[0]}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Warning Banner */}
        <div className="mb-6 border border-yellow-900/50 bg-yellow-950/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-bold text-sm">[WARNING] AUTHORIZED PERSONNEL ONLY</p>
              <p className="text-yellow-600/80 text-xs mt-1">
                This system accesses restricted databases. All queries are logged and monitored. 
                Unauthorized access is a criminal offense under the Data Protection Act.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 border border-green-900/50 bg-black/60 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-400 font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                SYSTEM CONFIGURATION
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-green-600 hover:text-green-400"
              >
                [CLOSE]
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-green-500 text-xs mb-1 block">WEBHOOK ENDPOINT URL</Label>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-n8n-instance.com/webhook/osint"
                  className="bg-black border-green-800 text-green-400 placeholder:text-green-900 font-mono text-sm focus:border-green-400 focus:ring-green-400/20"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            {/* Target Acquisition Form */}
            <div className="border border-green-900/50 bg-black/60 rounded-lg overflow-hidden">
              <div className="bg-green-950/30 px-4 py-2 border-b border-green-900/50 flex items-center gap-2">
                <Search className="w-4 h-4 text-green-500" />
                <span className="text-green-400 text-sm font-bold">TARGET_ACQUISITION.exe</span>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-green-500 text-xs mb-1 flex items-center gap-2">
                      <User className="w-3 h-3" />
                      root@osint:~$ enter_target_name
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Thabo Moyo"
                      className="bg-black border-green-800 text-green-400 placeholder:text-green-900 font-mono focus:border-green-400 focus:ring-green-400/20"
                      disabled={isScanning}
                    />
                  </div>

                  <div>
                    <Label className="text-green-500 text-xs mb-1 flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      root@osint:~$ enter_national_id
                    </Label>
                    <Input
                      value={omang}
                      onChange={(e) => setOmang(e.target.value)}
                      placeholder="Omang Number (optional)"
                      className="bg-black border-green-800 text-green-400 placeholder:text-green-900 font-mono focus:border-green-400 focus:ring-green-400/20"
                      disabled={isScanning}
                    />
                  </div>

                  <div>
                    <Label className="text-green-500 text-xs mb-1 flex items-center gap-2">
                      <Database className="w-3 h-3" />
                      root@osint:~$ enter_degree_profile
                    </Label>
                    <Input
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="e.g., Bachelor of Accountancy"
                      className="bg-black border-green-800 text-green-400 placeholder:text-green-900 font-mono focus:border-green-400 focus:ring-green-400/20"
                      disabled={isScanning}
                    />
                  </div>

                  <div>
                    <Label className="text-green-500 text-xs mb-1 flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      root@osint:~$ enter_geofence
                    </Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Last Known Location"
                      className="bg-black border-green-800 text-green-400 placeholder:text-green-900 font-mono focus:border-green-400 focus:ring-green-400/20"
                      disabled={isScanning}
                    />
                  </div>
                </div>

                <Button
                  onClick={initiateScan}
                  disabled={isScanning}
                  className="w-full bg-green-950/50 border border-green-600 hover:bg-green-900/50 hover:border-green-400 text-green-400 font-mono font-bold py-3 glitch disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <span className="flex items-center justify-center gap-2">
                      <Activity className="w-4 h-4 animate-pulse" />
                      [ SCANNING... ]
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Radio className="w-4 h-4" />
                      [ INITIATE SCAN ]
                    </span>
                  )}
                </Button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full text-center text-xs text-green-700 hover:text-green-500 transition-colors"
                >
                  [ CONFIGURE WEBHOOK ENDPOINT ]
                </button>
              </div>
            </div>

            {/* Results Panel */}
            {result && (
              <div className="border border-green-900/50 bg-black/60 rounded-lg overflow-hidden">
                <div className="bg-green-950/30 px-4 py-2 border-b border-green-900/50 flex items-center justify-between">
                  <span className="text-green-400 text-sm font-bold flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    INTELLIGENCE REPORT
                  </span>
                  <span className={`text-xs font-bold ${getConfidenceColor(result.confidence)}`}>
                    {getConfidenceIcon(result.confidence)} {result.confidence || 'UNKNOWN'}
                  </span>
                </div>
                
                <div className="p-4 space-y-3">
                  {result.best_employer && (
                    <div className="border-l-2 border-green-600 pl-3">
                      <p className="text-green-600 text-xs">EMPLOYER</p>
                      <p className="text-green-400 font-bold">{result.best_employer}</p>
                    </div>
                  )}
                  
                  {result.best_title && (
                    <div className="border-l-2 border-green-600 pl-3">
                      <p className="text-green-600 text-xs">TITLE/POSITION</p>
                      <p className="text-green-400">{result.best_title}</p>
                    </div>
                  )}
                  
                  {result.location && (
                    <div className="border-l-2 border-green-600 pl-3">
                      <p className="text-green-600 text-xs">LOCATION</p>
                      <p className="text-green-400">{result.location}</p>
                    </div>
                  )}
                  
                  {result.best_source && (
                    <div className="border-l-2 border-green-600 pl-3">
                      <p className="text-green-600 text-xs">PRIMARY SOURCE</p>
                      <p className="text-green-400">{result.best_source}</p>
                    </div>
                  )}
                  
                  {result.drift_warning && (
                    <div className="border border-red-900/50 bg-red-950/20 rounded p-3 mt-3">
                      <p className="text-red-400 text-sm font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        IDENTITY DRIFT DETECTED
                      </p>
                      <p className="text-red-500/80 text-xs mt-1">
                        AI matched names that do not equal the target. Results may be unreliable.
                      </p>
                    </div>
                  )}
                  
                  {result.action_required && (
                    <div className="border border-yellow-900/50 bg-yellow-950/20 rounded p-3">
                      <p className="text-yellow-400 text-xs">ACTION REQUIRED</p>
                      <p className="text-yellow-500/80 text-xs mt-1">
                        Manual verification recommended before proceeding.
                      </p>
                    </div>
                  )}
                  
                  {result.reasoning && (
                    <div className="mt-4 pt-3 border-t border-green-900/30">
                      <p className="text-green-600 text-xs mb-2">ANALYSIS LOG</p>
                      <p className="text-green-500/80 text-xs whitespace-pre-wrap">{result.reasoning}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Terminal Log */}
          <div className="border border-green-900/50 bg-black/80 rounded-lg overflow-hidden flex flex-col h-[600px]">
            <div className="bg-green-950/30 px-4 py-2 border-b border-green-900/50 flex items-center justify-between">
              <span className="text-green-400 text-sm font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                SYSTEM_LOG.txt
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-green-600 text-xs">LIVE</span>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1">
              {logs.length === 0 ? (
                <p className="text-green-800 italic">Waiting for input...</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex gap-3">
                    <span className="text-green-700 flex-shrink-0">[{log.timestamp}]</span>
                    <span className={`
                      ${log.type === 'error' ? 'text-red-400' : ''}
                      ${log.type === 'warning' ? 'text-yellow-400' : ''}
                      ${log.type === 'success' ? 'text-green-400' : ''}
                      ${log.type === 'system' ? 'text-cyan-400' : ''}
                      ${log.type === 'info' ? 'text-green-500' : ''}
                    `}>
                      {log.type === 'error' && '[!] '}
                      {log.type === 'warning' && '[?] '}
                      {log.type === 'success' && '[+] '}
                      {log.type === 'system' && '[*] '}
                      {log.type === 'info' && '[>] '}
                      {log.message}
                    </span>
                  </div>
                ))
              )}
              {isScanning && (
                <div className="flex gap-3">
                  <span className="text-green-700 flex-shrink-0">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                  <span className="text-green-400 cursor-blink">Processing</span>
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
            
            <div className="border-t border-green-900/50 px-4 py-2 bg-green-950/20">
              <div className="flex items-center gap-2 text-xs text-green-600">
                <span className="text-green-500">{'>'}</span>
                <span className="animate-pulse">_</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t border-green-900/30 pt-4 text-center">
          <p className="text-green-800 text-xs">
            DTEF OSINT TRACER // CLASSIFIED // UNAUTHORIZED ACCESS PROHIBITED
          </p>
          <p className="text-green-900 text-xs mt-1">
            All operations logged | Session ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
