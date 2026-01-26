import React, { useMemo } from 'react';
import { SimulationState } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { Wind, Sun, Zap, RotateCw, Pause } from 'lucide-react';

interface UIOverlayProps {
  simState: SimulationState;
  onStateChange: (key: keyof SimulationState, value: number) => void;
  isAuto: boolean;
  toggleAuto: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ simState, onStateChange, isAuto, toggleAuto }) => {
  
  // Calculate output based on simulation inputs
  const solarOutput = (simState.sunIntensity / 100) * 60; // Max 60 units
  const windOutput = (simState.windSpeed / 100) * 80; // Max 80 units
  const totalOutput = solarOutput + windOutput;
  const netEnergy = totalOutput - simState.totalDemand;

  const data = useMemo(() => [
    { name: 'Solar', value: Math.round(solarOutput), color: '#fbbf24' },
    { name: 'Wind', value: Math.round(windOutput), color: '#22d3ee' },
    { name: 'Demand', value: simState.totalDemand, color: '#ef4444' },
  ], [solarOutput, windOutput, simState.totalDemand]);

  const outputPercent = Math.min(100, Math.max(0, (totalOutput / simState.totalDemand) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* Header */}
      <header className="flex justify-between items-start pointer-events-auto">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-lg shadow-2xl">
          <h1 className="font-mono text-2xl font-bold tracking-widest text-white uppercase">
            Eco-City <span className="text-emerald-400">Live</span>
          </h1>
          <p className="text-slate-400 text-xs font-sans mt-1">Sustainable Energy Grid Visualization</p>
        </div>
        
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-lg shadow-2xl">
           <div className="text-right">
             <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Grid Status</div>
             <div className={`text-xl font-mono font-bold ${netEnergy >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {netEnergy >= 0 ? 'SURPLUS' : 'DEFICIT'} {Math.abs(Math.round(netEnergy))} MW
             </div>
           </div>
        </div>
      </header>

      {/* Main Stats Panel (Bottom Right) */}
      <div className="absolute bottom-6 right-6 w-80 bg-slate-900/90 backdrop-blur-lg border border-slate-700/50 p-6 rounded-xl shadow-2xl pointer-events-auto">
         <h2 className="font-mono text-lg text-white mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
            <Zap size={18} className="text-yellow-400" /> Real-time Production
         </h2>
         
         <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip 
                        contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px'}}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
         </div>
         
         <div className="mt-4 flex flex-col gap-1">
            <div className="flex justify-between text-xs text-slate-400">
                <span>Efficiency</span>
                <span>{Math.round(outputPercent)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ${outputPercent > 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                    style={{width: `${outputPercent}%`}}
                />
            </div>
         </div>
      </div>

      {/* Controls Panel (Bottom Left) */}
      <div className="absolute bottom-6 left-6 w-72 bg-slate-900/90 backdrop-blur-lg border border-slate-700/50 p-6 rounded-xl shadow-2xl pointer-events-auto">
        <div className="flex justify-between items-center mb-4">
             <h2 className="font-mono text-lg text-white">Simulation</h2>
             <button 
                onClick={toggleAuto}
                className={`p-2 rounded-full hover:bg-slate-700 transition-colors ${isAuto ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`}
             >
                {isAuto ? <RotateCw size={18} /> : <Pause size={18} />}
             </button>
        </div>

        {/* Wind Control */}
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 text-sm text-cyan-300 font-semibold">
                    <Wind size={16} /> Wind Speed
                </label>
                <span className="text-xs font-mono text-slate-400">{Math.round(simState.windSpeed)} km/h</span>
            </div>
            <input 
                type="range" 
                min="0" 
                max="100" 
                value={simState.windSpeed}
                onChange={(e) => onStateChange('windSpeed', Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
        </div>

        {/* Sun Control */}
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 text-sm text-amber-300 font-semibold">
                    <Sun size={16} /> Sun Intensity
                </label>
                <span className="text-xs font-mono text-slate-400">{Math.round(simState.sunIntensity)}%</span>
            </div>
            <input 
                type="range" 
                min="0" 
                max="100" 
                value={simState.sunIntensity}
                onChange={(e) => onStateChange('sunIntensity', Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
        </div>
      </div>

      {/* Instructional Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-0 animate-[fadeIn_3s_ease-in_2s_forwards]">
          <h3 className="text-white/20 font-mono text-4xl font-bold tracking-[0.5em] uppercase blur-[1px]">Sustainable Future</h3>
      </div>
    </div>
  );
};
