import React from "react";
import "./AnalyticsDashboard.css";

/**
 * A single stat card. Purely presentational — receives a computed value,
 * never computes anything itself.
 *
 * @param {string} label      - e.g. "Average Score"
 * @param {string|number} value - already formatted, e.g. "82.4%" or "24"
 * @param {string} [hint]     - small secondary line, e.g. "last 7 days"
 * @param {"neutral"|"good"|"warn"} [tone] - subtle accent color
 */
export default function StatCard({ label, value, hint, tone = "neutral" }) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      {hint && <div className="stat-card__hint">{hint}</div>}
    </div>
  );
}
