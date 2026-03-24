// ============================================================
// FASTING STRIP — Thin vertical bar on the timeline left edge
// Communicates "all activity today happens under a fast"
// ============================================================

import type { FastingState } from '@/store/types';

const FASTING_CONFIG: Record<Exclude<FastingState, 'none'>, { color: string; label: string; emoji: string }> = {
    '24h': { color: '#F59E0B', label: '24h', emoji: '🔥' },
    '36h': { color: '#DC2626', label: '36h', emoji: '🧘‍♂️' },
    'broken': { color: '#6B7280', label: 'Roto', emoji: '❌' },
};

interface FastingStripProps {
    fastingState: FastingState;
    totalHeight: number;
}

export function FastingStrip({ fastingState, totalHeight }: FastingStripProps) {
    const config = FASTING_CONFIG[fastingState as keyof typeof FASTING_CONFIG];
    if (!config) return null;

    return (
        <div
            className="absolute left-0 top-0 bottom-0 z-20 flex flex-col items-center"
            style={{ width: '4px', height: `${totalHeight}px` }}
        >
            {/* The vertical stripe */}
            <div
                className="absolute inset-0 rounded-full opacity-70"
                style={{ backgroundColor: config?.color }}
            />

            {/* Badge at the top */}
            <div
                className="absolute top-1 left-6 flex items-center gap-1 px-2 py-0.5 rounded-full text-white shadow-sm"
                style={{ backgroundColor: config?.color, fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
                <span>{config?.emoji}</span>
                <span>Ayuno {config?.label}</span>
            </div>
        </div>
    );
}
