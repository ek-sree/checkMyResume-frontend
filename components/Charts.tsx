'use client';

interface Point {
  label: string;
  score: number | null;
}

export function ScoreLineChart({ data }: { data: Point[] }) {
  const points = data.filter((d) => typeof d.score === 'number') as { label: string; score: number }[];

  if (points.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-ink-muted">
        Run a couple of analyses to see your score trend.
      </div>
    );
  }

  const W = 600;
  const H = 200;
  const pad = { l: 28, r: 12, t: 16, b: 24 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const x = (i: number) => pad.l + (i / (points.length - 1)) * innerW;
  const y = (v: number) => pad.t + (1 - v / 100) * innerH;

  const line = points.map((p, i) => `${x(i)},${y(p.score)}`).join(' ');
  const area = `${pad.l},${pad.t + innerH} ${line} ${x(points.length - 1)},${pad.t + innerH}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Match score over time">
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} stroke="#EBEAE4" strokeWidth={1} />
          <text x={4} y={y(g) + 3} fontSize={9} fill="#94A3B8">{g}</text>
        </g>
      ))}
      <polygon points={area} fill="#4F46E5" opacity={0.08} />
      <polyline
        points={line}
        fill="none"
        stroke="#4F46E5"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'draw 1.2s ease-out forwards' }}
      />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.score)} r={3.5} fill="#fff" stroke="#4F46E5" strokeWidth={2} />
      ))}
      <style>{`@keyframes draw { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
  );
}

export function KeywordBars({ data }: { data: { keyword: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-muted">No missing-keyword data yet.</p>;
  }
  const max = Math.max(...data.map((d) => d.count));

  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.keyword} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-sm text-ink-soft" title={d.keyword}>{d.keyword}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-rose-400 transition-[width] duration-700"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 text-right text-xs font-medium text-ink-muted">{d.count}</span>
        </li>
      ))}
    </ul>
  );
}
