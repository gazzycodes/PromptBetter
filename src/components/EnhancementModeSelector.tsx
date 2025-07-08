import React from 'react';
import { Code, Image, Zap, Settings } from 'lucide-react';
import { EnhancementMode, ENHANCEMENT_MODE_LABELS, ENHANCEMENT_MODE_DESCRIPTIONS } from '../types';

interface EnhancementModeSelectorProps {
  currentMode: EnhancementMode;
  onModeChange: (mode: EnhancementMode) => void;
  enableJuggernautXLSyntax: boolean;
  onToggleJuggernautXLSyntax: (enabled: boolean) => void;
}

export const EnhancementModeSelector: React.FC<EnhancementModeSelectorProps> = ({
  currentMode,
  onModeChange,
  enableJuggernautXLSyntax,
  onToggleJuggernautXLSyntax,
}) => {
  const modes: { key: EnhancementMode; icon: React.ReactNode; color: string }[] = [
    { key: 'ai-coding', icon: <Code size={20} />, color: 'text-blue-400' },
    { key: 'image-generation', icon: <Image size={20} />, color: 'text-purple-400' },
    { key: 'juggernaut-xl', icon: <Zap size={20} />, color: 'text-yellow-400' },
  ];

  return (
    <div className="border-b border-slate-700 bg-slate-800/30 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Enhancement Mode</h2>
          <Settings size={18} className="text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {modes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => onModeChange(mode.key)}
              className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                currentMode === mode.key
                  ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/20'
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={mode.color}>{mode.icon}</div>
                <h3 className="font-medium text-white">
                  {ENHANCEMENT_MODE_LABELS[mode.key]}
                </h3>
              </div>
              <p className="text-sm text-gray-400">
                {ENHANCEMENT_MODE_DESCRIPTIONS[mode.key]}
              </p>
            </button>
          ))}
        </div>

        {/* JuggernautXL specific settings */}
        {currentMode === 'juggernaut-xl' && (
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white mb-1">
                  Advanced Weight Syntax
                </h4>
                <p className="text-xs text-gray-400">
                  Enable JuggernautXL weight modifiers like (keyword:1.2) and ((keyword:1.5))
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableJuggernautXLSyntax}
                  onChange={(e) => onToggleJuggernautXLSyntax(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* Current mode description */}
        <div className="mt-4 p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-200">
            <strong>Current:</strong> {ENHANCEMENT_MODE_DESCRIPTIONS[currentMode]}
          </p>
        </div>
      </div>
    </div>
  );
};
