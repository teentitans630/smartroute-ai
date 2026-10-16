import React from 'react';
import { AlertTriangle, CheckCircle2, Shield, X, Radio } from 'lucide-react';
import { useHighway } from '../../context/HighwayContext';

export const ToastContainer: React.FC = () => {
  const { notifications, dismissToast } = useHighway();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {notifications.map((toast) => {
        const isEmergency = toast.type === 'emergency';
        const isDispatch = toast.type === 'dispatch';
        const isResolved = toast.type === 'resolved';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200 text-xs ${
              isEmergency
                ? 'bg-red-950/95 border-red-500/80 text-white'
                : isDispatch
                ? 'bg-blue-950/95 border-blue-500/80 text-white'
                : isResolved
                ? 'bg-emerald-950/95 border-emerald-500/80 text-white'
                : 'bg-slate-900/95 border-slate-700 text-slate-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isEmergency && <AlertTriangle className="w-4 h-4 text-red-400" />}
              {isDispatch && <Shield className="w-4 h-4 text-blue-400" />}
              {isResolved && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {toast.type === 'info' && <Radio className="w-4 h-4 text-amber-400" />}
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-bold">{toast.title}</span>
                <span className="text-[10px] text-slate-400 font-mono ml-2">
                  {toast.timestamp}
                </span>
              </div>
              <p className="text-[11px] opacity-90 leading-tight">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white shrink-0 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
