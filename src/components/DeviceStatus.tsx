import React from 'react';
import { useDeviceStatus } from '../hooks/useDeviceStatus';
import { format } from 'date-fns';
import { Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, Clock, Calendar } from 'lucide-react';

export const DeviceStatus = () => {
  const { time, battery } = useDeviceStatus();

  const getBatteryIcon = () => {
    if (battery.charging) return <BatteryCharging className="w-4 h-4 text-emerald-500" />;
    if (battery.level > 80) return <BatteryFull className="w-4 h-4 text-slate-600 dark:text-slate-300" />;
    if (battery.level > 40) return <BatteryMedium className="w-4 h-4 text-slate-600 dark:text-slate-300" />;
    if (battery.level > 15) return <BatteryLow className="w-4 h-4 text-amber-500" />;
    return <Battery className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        <span>{format(time, 'h:mm a')}</span>
      </div>
      <div className="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
      <div className="flex items-center gap-1.5 hidden sm:flex">
        <Calendar className="w-3.5 h-3.5" />
        <span>{format(time, 'MMM d, yyyy')}</span>
      </div>
      {battery.supported && (
        <>
          <div className="w-px h-3 bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
          <div className="flex items-center gap-1.5">
            {getBatteryIcon()}
            <span>{battery.level}%</span>
          </div>
        </>
      )}
    </div>
  );
};
