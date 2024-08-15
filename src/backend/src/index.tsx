import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AdminPage } from "./pages/AdminPage";
import { DocsPage } from "./pages/DocsPage";


const router = createBrowserRouter([
  {
    path: "/*",
    element: <AdminPage />,    
  },
  {
    path: "/docs",
    element: <DocsPage />,    
  },
  
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
