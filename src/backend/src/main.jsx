import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import './index.css'

import {Home} from "./pages/home.jsx"
import {Docs} from "./pages/docs.jsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,    
  },
  {
    path: "/docs",
    element: <Docs />,    
  },
  
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
