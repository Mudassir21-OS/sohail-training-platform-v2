import React, { useEffect, useState, useCallback } from "react";
import StatCard from "./StatCard";
import SubmissionTrendChart from "./SubmissionTrendChart";
import TraineePerformanceTable from "./TraineePerformanceTable";
import ExportReportButton from "./ExportReportButton";
import "./AnalyticsDashboard.css";

/**
 * Admin Analytics dashboard. Fetches everything from the analytics API —
 * no aggregation happens in this file. If a number needs computing, it
 * belongs in Mudassir's queries / Abdul's endpoints, not here.
 *
 * Props:
 *   token - JWT for Authorization header (same pattern as TeamTaskForm)
 */
export default function AnalyticsDashboard({ token }) {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState(null);
  const [trainees, setTrainees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, trendRes, traineesRes] = await Promise.all([
        fetch("https://sohail-backend-api.onrender.com/api/analytics/summary", { headers: authHeaders }),
        fetch("https://sohail-backend-api.onrender.com/api/analytics/submission-trend?days=30", { headers: authHeaders }),
        fetch("https://sohail-backend-api.onrender.com/api/analytics/trainees", { headers: authHeaders }),
      ]);

      if (!summaryRes.ok || !trendRes.ok || !traineesRes.ok) {
        throw new Error("One or more analytics endpoints failed to respond.");
      }

      const [summaryData, trendData, traineesData] = await Promise.all([
        summaryRes.json(),
        trendRes.json(),
        traineesRes.json(),
      ]);

      setSummary(summaryData);
      setTrend(trendData);
      setTrainees(traineesData);
    } catch (err) {
      setError(err.message || "Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">Loading live analytics…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <p>{error}</p>
          <button className="retry-btn" onClick={loadAll}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Analytics</h2>
          <p className="analytics-subtitle">
            Live metrics computed from the database — refreshes on load.
          </p>
        </div>
        <div className="analytics-header__actions">
          <button className="refresh-btn" onClick={loadAll}>
            Refresh
          </button>
          <ExportReportButton token={token} format="csv" />
        </div>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Average Score"
          value={`${summary.avgScore.toFixed(1)}`}
          hint="across all graded work"
        />
        <StatCard
          label="Submission Rate"
          value={`${Math.round(summary.submissionRate * 100)}%`}
          hint="submitted vs assigned"
          tone={summary.submissionRate >= 0.8 ? "good" : "warn"}
        />
        <StatCard
          label="On-time Rate"
          value={`${Math.round(summary.onTimeRate * 100)}%`}
          hint="submitted before deadline"
          tone={summary.onTimeRate >= 0.7 ? "good" : "warn"}
        />
        <StatCard
          label="Active Team Tasks"
          value={summary.activeTeamTasks}
        />
        <StatCard
          label="Trainees"
          value={summary.totalTrainees}
        />
        <StatCard
          label="Graded This Week"
          value={summary.gradedThisWeek}
        />
      </div>

      <SubmissionTrendChart data={trend} />

      <TraineePerformanceTable trainees={trainees} />
    </div>
  );
}
