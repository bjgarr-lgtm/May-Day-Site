
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import OpsLayout from "./OpsLayout";
import DashboardView from "./views/DashboardView";
import TasksView from "./views/TasksView";
import TimelineView from "./views/TimelineView";
import ProgrammingView from "./views/ProgrammingView";
import ResourcesView from "./views/ResourcesView";
import VolunteersView from "./views/VolunteersView";
import RunOfShowView from "./views/RunOfShowView";
import DayOfView from "./views/DayOfView";
import "./ops.css";

export default function OpsApp() {
  return (
    <Routes>
      <Route element={<OpsLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="tasks" element={<TasksView />} />
        <Route path="timeline" element={<TimelineView />} />
        <Route path="programming" element={<ProgrammingView />} />
        <Route path="resources" element={<ResourcesView />} />
        <Route path="volunteers" element={<VolunteersView />} />
        <Route path="run-of-show" element={<RunOfShowView />} />
        <Route path="day-of" element={<DayOfView />} />
      </Route>
    </Routes>
  );
}
