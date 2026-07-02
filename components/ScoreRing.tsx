interface ScoreRingProps {
  score: number; // 0-100
  size?: number;
  label?: string;
}

export function ScoreRing({ score, size = 132, label = 'ATS match' }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const color = clamped >= 75 ? '#059669' : clamped >= 50 ? '#D97706' : '#E11D48';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EBEAE4" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-ink">{clamped}</span>
          <span className="text-xs font-medium text-ink-muted">/ 100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-ink-soft">{label}</span>
    </div>
  );
}
