import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin only */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
          </Route>

          {/* Trainee only */}
          <Route element={<ProtectedRoute role="trainee" />}>
            <Route path="/dashboard" element={<div>Trainee Dashboard</div>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
