import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AdminPage } from "./pages/AdminPage";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AdminPage></AdminPage>
  </React.StrictMode>
);
