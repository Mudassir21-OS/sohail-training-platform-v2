import React, { useState, useMemo } from "react";
import "./AnalyticsDashboard.css";

/**
 * Per-trainee performance table. Sorting happens client-side (fine — it's
 * reordering already-aggregated rows, not computing new stats), but every
 * value shown comes straight from GET /api/analytics/trainees.
 */
export default function TraineePerformanceTable({ trainees }) {
  const [sortKey, setSortKey] = useState("avgScore");
  const [sortDir, setSortDir] = useState("desc");

  const sorted = useMemo(() => {
    const rows = [...trainees];
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      return sortDir === "asc" ? (av > bv ? 1 : -1) : av > bv ? -1 : 1;
    });
    return rows;
  }, [trainees, sortKey, sortDir]);

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const columns = [
    { key: "name", label: "Trainee" },
    { key: "avgScore", label: "Avg Score" },
    { key: "tasksCompleted", label: "Completed" },
    { key: "submissionRate", label: "Submission Rate" },
    { key: "onTimeCount", label: "On-time" },
    { key: "lateCount", label: "Late" },
  ];

  if (!trainees || trainees.length === 0) {
    return (
      <div className="table-card">
        <div className="table-card__title">Per-Trainee Performance</div>
        <div className="chart-empty">No trainee data yet.</div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-card__title">Per-Trainee Performance</div>
      <div className="table-scroll">
        <table className="perf-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => toggleSort(col.key)}>
                  {col.label}
                  {sortKey === col.key && (
                    <span className="sort-arrow">
                      {sortDir === "asc" ? " ▲" : " ▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => {
              const rate =
                t.tasksAssigned > 0
                  ? Math.round((t.tasksCompleted / t.tasksAssigned) * 100)
                  : 0;
              return (
                <tr key={t.id}>
                  <td className="perf-table__name">{t.name}</td>
                  <td>
                    <span
                      className={
                        "score-pill " +
                        (t.avgScore >= 80
                          ? "score-pill--good"
                          : t.avgScore >= 60
                          ? "score-pill--mid"
                          : "score-pill--low")
                      }
                    >
                      {t.avgScore.toFixed(1)}
                    </span>
                  </td>
                  <td>
                    {t.tasksCompleted}/{t.tasksAssigned}
                  </td>
                  <td>{rate}%</td>
                  <td>{t.onTimeCount}</td>
                  <td className={t.lateCount > 0 ? "late-count" : ""}>
                    {t.lateCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
