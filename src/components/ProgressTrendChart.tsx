import React, { useState, useMemo, useRef } from 'react';
import { useNour } from '../context/NourContext';
import { 
  ProgressRange, 
  getProgressTrendData, 
  generateSmoothSvgPath,
  ProgressTrendPoint 
} from '../utils/progressTrend';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

export const ProgressTrendChart: React.FC = () => {
  const { state, todayKey } = useNour();
  const [range, setRange] = useState<ProgressRange>('7D');
  const [hoveredPoint, setHoveredPoint] = useState<ProgressTrendPoint | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const { points, summary } = useMemo(() => {
    return getProgressTrendData(state, range, todayKey);
  }, [state, range, todayKey]);

  // Coordinate mapping for SVG viewBox: 0 0 640 220
  const VIEW_WIDTH = 640;
  const VIEW_HEIGHT = 220;
  const PADDING_TOP = 25;
  const PADDING_BOTTOM = 35;
  const PADDING_LEFT = 38;
  const PADDING_RIGHT = 20;

  const graphWidth = VIEW_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const graphHeight = VIEW_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const baselineY = VIEW_HEIGHT - PADDING_BOTTOM;

  const coords = useMemo(() => {
    if (points.length === 0) return [];
    if (points.length === 1) {
      const y = PADDING_TOP + (1 - points[0].score / 100) * graphHeight;
      return [{ x: PADDING_LEFT + graphWidth / 2, y, point: points[0] }];
    }

    return points.map((p, i) => {
      const x = PADDING_LEFT + (i / (points.length - 1)) * graphWidth;
      const y = PADDING_TOP + (1 - p.score / 100) * graphHeight;
      return { x, y, point: p };
    });
  }, [points, graphWidth, graphHeight, baselineY]);

  const splinePath = useMemo(() => {
    return generateSmoothSvgPath(coords);
  }, [coords]);

  const areaPath = useMemo(() => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return '';
    const first = coords[0];
    const last = coords[coords.length - 1];
    return `${splinePath} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;
  }, [splinePath, coords, baselineY]);

  // Handle pointer tracking on chart for interactive tooltip
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!svgContainerRef.current || coords.length === 0) return;
    const rect = svgContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clientX / rect.width));
    const targetSvgX = ratio * VIEW_WIDTH;

    // Find nearest point
    let nearest = coords[0];
    let minDistance = Math.abs(coords[0].x - targetSvgX);

    for (let i = 1; i < coords.length; i++) {
      const dist = Math.abs(coords[i].x - targetSvgX);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = coords[i];
      }
    }

    setHoveredPoint(nearest.point);
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
  };

  const activePoint = hoveredPoint || (coords.length > 0 ? coords[coords.length - 1].point : null);
  const activeCoord = activePoint ? coords.find(c => c.point.key === activePoint.key) : null;

  const ranges: ProgressRange[] = ['7D', '30D', '3M', '6M', '1Y'];

  return (
    <section id="section-progress-trend-stock" className="apple-card p-6 sm:p-7 space-y-6">
      {/* Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Summary Title & Value */}
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-[#86868b] tracking-tight uppercase">
            <Activity className="w-3.5 h-3.5 text-[#1d1d1f]" />
            <span>Progress Trend</span>
          </div>

          <div className="flex items-baseline gap-3 mt-1">
            <div className="text-3xl font-semibold font-tabular-nums text-[#1d1d1f] tracking-tight">
              {activePoint ? `${activePoint.score}%` : `${summary.currentScore}%`}
            </div>

            {/* Comparison vs previous period */}
            {summary.diffPercent !== undefined ? (
              <div className="flex items-center gap-1 text-xs">
                {summary.diffPercent > 0 ? (
                  <span className="flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 font-medium text-xs font-tabular-nums">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{summary.diffPercent}% vs previous
                  </span>
                ) : summary.diffPercent < 0 ? (
                  <span className="flex items-center px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-800 font-medium text-xs font-tabular-nums">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {summary.diffPercent}% vs previous
                  </span>
                ) : (
                  <span className="flex items-center px-2 py-0.5 rounded-full bg-black/[0.04] text-[#6e6e73] font-medium text-xs font-tabular-nums">
                    <Minus className="w-3 h-3 mr-1" />
                    0% vs previous
                  </span>
                )}
              </div>
            ) : null}
          </div>
          
          <div className="text-xs text-[#86868b] mt-0.5">
            {activePoint ? activePoint.tooltipTitle : 'Historical execution trajectory'}
          </div>
        </div>

        {/* Range Selector macOS Segmented Controls */}
        <div className="flex items-center bg-black/[0.04] p-1 rounded-xl self-start sm:self-auto border border-black/[0.04]">
          {ranges.map((r) => {
            const isActive = range === r;
            return (
              <button
                key={r}
                id={`progress-range-btn-${r.toLowerCase()}`}
                onClick={() => {
                  setRange(r);
                  setHoveredPoint(null);
                }}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas or Clean Empty State */}
      {!summary.hasEnoughData && points.every(p => p.score === 0) ? (
        <div className="py-14 px-4 text-center border border-dashed border-black/[0.08] rounded-2xl bg-black/[0.015]">
          <p className="text-sm font-medium text-[#1d1d1f]">No progress history yet.</p>
          <p className="text-xs text-[#86868b] mt-1 max-w-sm mx-auto">
            Complete your planned activities to build your trend.
          </p>
        </div>
      ) : (
        <div
          ref={svgContainerRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative w-full overflow-hidden select-none cursor-crosshair touch-none"
          style={{ height: '220px' }}
        >
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="appleTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d1d1f" stopOpacity="0.08" />
                <stop offset="60%" stopColor="#1d1d1f" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#1d1d1f" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid reference lines: 100%, 75%, 50%, 25% */}
            {[100, 75, 50, 25].map((val) => {
              const y = PADDING_TOP + (1 - val / 100) * graphHeight;
              return (
                <g key={val}>
                  <line
                    x1={PADDING_LEFT}
                    y1={y}
                    x2={VIEW_WIDTH - PADDING_RIGHT}
                    y2={y}
                    stroke="rgba(0,0,0,0.06)"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                  <text
                    x={PADDING_LEFT - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="fill-[#86868b] font-tabular-nums text-[10px] font-medium"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#appleTrendGradient)"
                className="transition-all duration-300"
              />
            )}

            {/* Main Trend Line */}
            {splinePath && (
              <path
                d={splinePath}
                fill="none"
                stroke="#1d1d1f"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            )}

            {/* X-axis tick labels */}
            {coords.map((c, idx) => {
              if (!c.point.label) return null;
              return (
                <text
                  key={`label-${idx}`}
                  x={c.x}
                  y={VIEW_HEIGHT - 10}
                  textAnchor="middle"
                  className="fill-[#86868b] font-tabular-nums text-[10px]"
                >
                  {c.point.label}
                </text>
              );
            })}

            {/* Active / Hover Scrubber Line & Dot */}
            {activeCoord && (
              <g className="transition-all duration-100">
                {/* Vertical hairline crosshair */}
                <line
                  x1={activeCoord.x}
                  y1={PADDING_TOP}
                  x2={activeCoord.x}
                  y2={baselineY}
                  stroke="#1d1d1f"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  opacity="0.4"
                />

                {/* Outer halo */}
                <circle
                  cx={activeCoord.x}
                  cy={activeCoord.y}
                  r="6"
                  fill="#1d1d1f"
                  fillOpacity="0.1"
                />

                {/* Center dot */}
                <circle
                  cx={activeCoord.x}
                  cy={activeCoord.y}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#1d1d1f"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>

          {/* Floating Tooltip positioned near active coordinate */}
          {activeCoord && hoveredPoint && (
            <div
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full z-20"
              style={{
                left: `${(activeCoord.x / VIEW_WIDTH) * 100}%`,
                top: `${Math.max(16, (activeCoord.y / VIEW_HEIGHT) * 100 - 8)}%`
              }}
            >
              <div className="bg-white border border-black/[0.1] rounded-xl px-3 py-2 shadow-lg text-center whitespace-nowrap">
                <div className="text-[10px] text-[#86868b] font-medium">{activeCoord.point.tooltipTitle}</div>
                <div className="text-xs font-semibold text-[#1d1d1f] font-tabular-nums mt-0.5">
                  {activeCoord.point.score}% Progress
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
