import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { studentNav, studentBottomNav, studentTopLinks } from "./config/navConfig";

// Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import Directory from "./pages/student/Directory";
import SubmissionDetail from "./pages/student/SubmissionDetail";
import TrackStatus from "./pages/student/TrackStatus";
import Profile from "./pages/shared/Profile";
import SupportCenter from "./pages/shared/SupportCenter";
import ServiceCatalog from "./pages/student/ServiceCatalog";
import Notifications from "./pages/shared/Notifications";
import Settings from "./pages/shared/Settings";
import MyRequests from "./pages/student/MyRequests";
import MyComplaints from "./pages/student/MyComplaints";
import NewServiceRequest from "./pages/student/NewServiceRequest";
import NewComplaint from "./pages/student/NewComplaint";

function App() {
  return (
    <Router>
      <Routes>
        {/* STUDENT ROUTES */}
        <Route
          element={
            <AppLayout
              navItems={studentNav}
              bottomNavItems={studentBottomNav}
              topNavLinks={studentTopLinks}
            />
          }
        >
          <Route path="/" element={<StudentDashboard />} />
          <Route path="/catalog" element={<ServiceCatalog />} />
          <Route path="/complaints" element={<MyComplaints />} />
          <Route path="/requests" element={<MyRequests />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/track-status" element={<TrackStatus />} />

          {/* DYNAMIC ROUTE: This handles clicking any card with an ID for student dashboard */}
          <Route path="/submission/:id" element={<SubmissionDetail />} />
        </Route>

        {/* FOCUS MODE LAYOUT for Student dashboard (No Sidebar for heavy forms) */}
        <Route
          element={
            <AppLayout
              navItems={studentNav}
              bottomNavItems={studentBottomNav}
              hideSidebar={true}
            />
          }
        >
          <Route path="/new-complaint" element={<NewComplaint />} />
          <Route path="/new-service-request" element={<NewServiceRequest />} />

        </Route>

        {/* SHARED */}
        <Route
          element={
            <AppLayout
              navItems={studentNav}
              bottomNavItems={studentBottomNav}
              topNavLinks={studentTopLinks}
            />
          }
        >
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/support" element={<SupportCenter />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
