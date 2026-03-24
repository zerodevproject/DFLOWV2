// ============================================================
// CURRENT TIME LINE — Animated red line showing current time
// ============================================================

import { useState, useEffect } from 'react';

const TIMELINE_START_HOUR = 7;
const TIMELINE_END_HOUR = 23;
const TOTAL_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR;

export function CurrentTimeLine() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const hours = now.getHours() + now.getMinutes() / 60;
    if (hours < TIMELINE_START_HOUR || hours > TIMELINE_END_HOUR) return null;

    const pct = ((hours - TIMELINE_START_HOUR) / TOTAL_HOURS) * 100;

    return (
        <div
            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
            style={{ top: `${pct}%` }}
        >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.6)] shrink-0 -ml-1" />
            <div className="flex-1 h-px bg-red-500 opacity-80" />
        </div>
    );
}

export { TIMELINE_START_HOUR, TIMELINE_END_HOUR, TOTAL_HOURS };
