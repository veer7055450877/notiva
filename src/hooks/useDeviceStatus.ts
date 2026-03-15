import { useState, useEffect } from 'react';

interface BatteryState {
  level: number;
  charging: boolean;
  supported: boolean;
}

export const useDeviceStatus = () => {
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState<BatteryState>({ level: 100, charging: false, supported: false });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Battery Status API
    const nav = navigator as any;
    if (nav.getBattery) {
      nav.getBattery().then((bat: any) => {
        const updateBattery = () => {
          setBattery({
            level: Math.round(bat.level * 100),
            charging: bat.charging,
            supported: true
          });
        };
        updateBattery();
        bat.addEventListener('levelchange', updateBattery);
        bat.addEventListener('chargingchange', updateBattery);
      });
    }

    return () => clearInterval(timer);
  }, []);

  return { time, battery };
};
