import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Bot, 
  Flame, 
  BookOpen, 
  Calendar, 
  Send, 
  Settings2, 
  Briefcase, 
  Users, 
  AlertCircle,
  CheckCircle2,
  Copy,
  ArrowRight,
  Terminal
} from 'lucide-react';

import { Mode, StartupProfile, Tone } from './types';
import { streamOpsResponse } from './services/geminiService';
import { INITIAL_PROFILE } from './constants';

const App: React.FC = () => {
  // State
  const [profile, setProfile] = useState<StartupProfile>(INITIAL_PROFILE);
  const [isProfileOpen, setIsProfileOpen] = useState(true);
  const [mode, setMode] = useState<Mode>(Mode.FIRE_FIGHT);
  const [rawInput, setRawInput] = useState('');
  const [extraInstructions, setExtraInstructions] = useState('');
  
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const responseEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of response as it streams
  useEffect(() => {
    if (isLoading && responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response, isLoading]);

  const handleSubmit = async () => {
    if (!rawInput.trim()) {
      setError("Please provide some input text to analyze.");
      return;
    }
    if (!profile.name) {
      setError("Please complete your Startup Profile first.");
      setIsProfileOpen(true);
      return;
    }

    setIsLoading(true);
    setResponse('');
    setError(null);
    setCopied(false);

    try {
      const stream = streamOpsResponse({
        profile,
        mode,
        rawInput,
        extraInstructions
      });

      for await (const chunk of stream) {
        setResponse(prev => prev + chunk);
      }
    } catch (err) {
      setError("Failed to generate response. Please check your API key and connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderModeIcon = (m: Mode) => {
    switch (m) {
      case Mode.FIRE_FIGHT: return <Flame className="w-4 h-4" />;
      case Mode.SOP: return <BookOpen className="w-4 h-4" />;
      case Mode.WEEKLY_BRIEF: return <Calendar className="w-4 h-4" />;
    }
  };

  const getModeColor = (m: Mode) => {
     switch (m) {
      case Mode.FIRE_FIGHT: return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      case Mode.SOP: return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case Mode.WEEKLY_BRIEF: return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
    }
  };

  const getActiveModeColor = (m: Mode) => {
    switch (m) {
     case Mode.FIRE_FIGHT: return 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200';
     case Mode.SOP: return 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200';
     case Mode.WEEKLY_BRIEF: return 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200';
   }
 };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800 font-sans">
      
      {/* LEFT PANEL - INPUTS */}
      <div className="w-full md:w-[450px] bg-white border-r border-slate-200 flex flex-col h-screen overflow-y-auto shrink-0 shadow-xl z-10">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-white sticky top-0 z-20">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-900 leading-tight">Ops Co-Pilot</h1>
            <p className="text-xs text-slate-500 font-medium">Your AI Operations Manager</p>
          </div>
        </div>

        <div className="p-6 space-y-8 pb-20">
          
          {/* Startup Profile Section */}
          <div className="space-y-3">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-between w-full text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>Startup Profile</span>
              </div>
              <Settings2 className={`w-4 h-4 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Company Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    placeholder="e.g. Acme Inc."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">One-line Description</label>
                  <input 
                    type="text" 
                    value={profile.description}
                    onChange={(e) => setProfile({...profile, description: e.target.value})}
                    placeholder="e.g. B2B SaaS for Logistics"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Industry</label>
                      <input 
                        type="text" 
                        value={profile.industry}
                        onChange={(e) => setProfile({...profile, industry: e.target.value})}
                        placeholder="e.g. Fintech"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Team Size</label>
                      <select 
                        value={profile.teamSize}
                        onChange={(e) => setProfile({...profile, teamSize: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                      >
                        <option value="1-5">1-5 people</option>
                        <option value="5-10">5-10 people</option>
                        <option value="10-15">10-15 people</option>
                      </select>
                    </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Communication Tone</label>
                  <div className="flex gap-2">
                    {Object.values(Tone).map((t) => (
                      <button
                        key={t}
                        onClick={() => setProfile({...profile, tone: t})}
                        className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${profile.tone === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mode Selection */}
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Settings2 className="w-4 h-4" />
                <span>Operation Mode</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(Mode).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${mode === m ? getActiveModeColor(m) : getModeColor(m)}`}
                  >
                    <div className={`p-2 rounded-lg ${mode === m ? 'bg-white/20' : 'bg-white'}`}>
                      {renderModeIcon(m)}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{m.replace('_', ' ')}</div>
                      <div className="text-[10px] opacity-80 font-medium">
                        {m === Mode.FIRE_FIGHT ? 'Crisis management & action plans' : m === Mode.SOP ? 'Process documentation & checklists' : 'Status updates & team alignment'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
          </div>

          {/* Raw Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Raw Context</span>
              </div>
            </div>
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste emails, messy notes, Slack dumps, or describe the problem here..."
              className="w-full h-40 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Extra Instructions */}
          <div className="space-y-3">
             <label className="block text-xs font-semibold text-slate-500 uppercase">Extra Instructions (Optional)</label>
             <input 
                type="text" 
                value={extraInstructions}
                onChange={(e) => setExtraInstructions(e.target.value)}
                placeholder="e.g. 'Make it very concise', 'Focus on marketing'"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
          </div>
          
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300'}`}
          >
            {isLoading ? (
               <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Input...</span>
               </>
            ) : (
              <>
                <span>Generate Plan</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL - OUTPUT */}
      <div className="flex-1 h-screen overflow-y-auto bg-slate-50 relative">
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!response && !error && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center opacity-60">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Terminal className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-600 mb-2">Ready to Optimize</h3>
            <p className="max-w-xs mx-auto">Fill in the details on the left and I'll generate actionable plans, SOPs, or briefs for you.</p>
          </div>
        )}

        {(response || isLoading) && (
          <div className="max-w-3xl mx-auto p-8 md:p-12 pb-32">
            {response && (
              <div className="flex justify-end mb-4 sticky top-4 z-20">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
            
            <div className="prose prose-slate prose-sm md:prose-base max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 mb-4 mt-8 pb-2 border-b border-slate-200" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-900 mb-3 mt-8" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-800 mb-2 mt-6" {...props} />,
                  p: ({node, ...props}) => <p className="text-slate-700 leading-relaxed mb-4" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-4 text-slate-700" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 mb-4 text-slate-700" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-200 pl-4 italic text-slate-600 my-4" {...props} />,
                  code: ({node, ...props}) => <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800" {...props} />,
                }}
              >
                {response}
              </ReactMarkdown>
            </div>
            
            <div ref={responseEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;