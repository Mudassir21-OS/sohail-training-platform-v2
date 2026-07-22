import React, { useMemo, useState } from "react";
import "./AnalyticsDashboard.css";

/**
 * Renders submission volume as bars and average score as an overlaid line,
 * both from server-aggregated data (GET /api/analytics/submission-trend).
 * No client-side computation — this component only maps numbers to pixels.
 *
 * @param {Array<{date: string, submissions: number, avgScore: number}>} data
 */
export default function SubmissionTrendChart({ data }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  const width = 720;
  const height = 260;
  const padding = { top: 20, right: 20, bottom: 32, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const { bars, linePoints, maxSubmissions } = useMemo(() => {
    if (!data || data.length === 0) {
      return { bars: [], linePoints: "", maxSubmissions: 0 };
    }
    const maxSub = Math.max(1, ...data.map((d) => d.submissions));
    const slot = chartW / data.length;
    const barW = Math.min(28, slot * 0.5);

    const barsOut = data.map((d, i) => {
      const barH = (d.submissions / maxSub) * chartH;
      const x = padding.left + i * slot + (slot - barW) / 2;
      const y = padding.top + (chartH - barH);
      return { x, y, w: barW, h: barH, ...d };
    });

    const pointsOut = data
      .map((d, i) => {
        const x = padding.left + i * slot + slot / 2;
        const y = padding.top + chartH - (d.avgScore / 100) * chartH;
        return `${x},${y}`;
      })
      .join(" ");

    return { bars: barsOut, linePoints: pointsOut, maxSubmissions: maxSub };
  }, [data, chartW, chartH]);

  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card__title">Submissions &amp; Average Score</div>
        <div className="chart-empty">No submission data yet for this range.</div>
      </div>
    );
  }

  const labelStep = Math.max(1, Math.ceil(data.length / 8));

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div className="chart-card__title">Submissions &amp; Average Score</div>
        <div className="chart-card__legend">
          <span className="legend-item">
            <span className="legend-swatch legend-swatch--bar" /> Submissions
          </span>
          <span className="legend-item">
            <span className="legend-swatch legend-swatch--line" /> Avg score
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img"
           aria-label="Submissions and average score over time">
        {/* horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = padding.top + chartH * (1 - f);
          return (
            <line
              key={f}
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              className="chart-gridline"
            />
          );
        })}

        {/* bars = submission count */}
        {bars.map((b, i) => (
          <rect
            key={b.date}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            className="chart-bar"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          />
        ))}

        {/* line = avg score */}
        <polyline points={linePoints} className="chart-line" />
        {data.map((d, i) => {
          const slot = chartW / data.length;
          const x = padding.left + i * slot + slot / 2;
          const y = padding.top + chartH - (d.avgScore / 100) * chartH;
          return (
            <circle
              key={d.date}
              cx={x}
              cy={y}
              r={hoverIdx === i ? 5 : 3}
              className="chart-dot"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
          );
        })}

        {/* x-axis date labels, thinned out to avoid crowding */}
        {data.map((d, i) => {
          if (i % labelStep !== 0) return null;
          const slot = chartW / data.length;
          const x = padding.left + i * slot + slot / 2;
          return (
            <text
              key={d.date}
              x={x}
              y={height - 8}
              className="chart-axis-label"
              textAnchor="middle"
            >
              {d.date.slice(5)}
            </text>
          );
        })}
      </svg>

      {hoverIdx !== null && (
        <div className="chart-tooltip">
          <strong>{data[hoverIdx].date}</strong> — {data[hoverIdx].submissions}{" "}
          submission{data[hoverIdx].submissions === 1 ? "" : "s"}, avg score{" "}
          {data[hoverIdx].avgScore.toFixed(1)}
        </div>
      )}
    </div>
  );
}
