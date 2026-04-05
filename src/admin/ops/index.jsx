import React from "react";
import OpsApp from "./OpsApp";
import { withOpsProvider } from "./seedData";

export default function MayDayOpsConsole() {
  return withOpsProvider(<OpsApp />);
}