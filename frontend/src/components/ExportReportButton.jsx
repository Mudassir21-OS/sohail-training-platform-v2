import React, { useState } from "react";
import "./AnalyticsDashboard.css";

/**
 * Calls GET /api/analytics/export, which returns a server-generated
 * CSV or PDF (per Abdul's export endpoint) — this component never builds
 * the file itself, only requests it and saves the response as a download.
 *
 * @param {string} token   - JWT for Authorization header
 * @param {"csv"|"pdf"} [format]
 */
export default function ExportReportButton({ token, format = "csv" }) {
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleExport() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/analytics/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Export failed (${res.status})`);
      }

      const blob = await res.blob();

      // Prefer the filename the server sent, fall back to a sensible default
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename =
        match?.[1] ||
        `analytics-report-${new Date().toISOString().slice(0, 10)}.${format}`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong exporting the report.");
    }
  }

  return (
    <div className="export-wrap">
      <button
        className="export-btn"
        onClick={handleExport}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Exporting…" : `Export Report (${format.toUpperCase()})`}
      </button>
      {status === "error" && <div className="export-error">{errorMsg}</div>}
    </div>
  );
}
