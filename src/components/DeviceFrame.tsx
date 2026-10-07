import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface DeviceFrameProps {
  isMobileFrame: boolean;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ isMobileFrame, children }) => {
  if (!isMobileFrame) {
    return <div className="w-full min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  return (
    <div className="w-full min-h-screen bg-slate-950 py-6 sm:py-10 flex flex-col items-center justify-center px-2 select-none">
      {/* Mobile Frame Shell */}
      <div className="relative w-full max-w-[420px] h-[860px] max-h-[95vh] bg-slate-950 rounded-[48px] border-[8px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden ring-1 ring-slate-700/50">
        {/* Dynamic Island / Notch & Top Status Bar */}
        <div className="h-10 w-full bg-slate-900/95 flex items-center justify-between px-7 shrink-0 text-slate-300 text-[11px] font-bold z-40 border-b border-slate-800/40">
          <span>9:41</span>
          {/* Dynamic Island Pill */}
          <div className="w-20 h-4 bg-slate-950 rounded-full border border-slate-800/80 mx-auto" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Inner App Content */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden bg-slate-950 flex flex-col relative">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="h-5 w-full bg-slate-950 flex items-center justify-center shrink-0 z-40">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
