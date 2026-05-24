# Part 3: Frontend Setup, Shell Layout & Clean Routes

In this guide, you will initialize a clean, simple, and distraction-free frontend shell using **Tailwind CSS v4**, **React Router**, and **Zustand**. This architecture implements a robust routing firewall, minimalist styling, dedicated error pages, and reactive form validation.

---

## 1. Minimalist Theme & Design Tokens (TailwindCSS v4)

Following a clean, high-utility UI philosophy (similar to Notion or Linear), we rely on solid neutral slates, crisp borders, and clear typographic hierarchy, avoiding loud gradients or distracting animations.

### Directives & Foundations (`src/index.css`)
Open `frontend/src/index.css` and configure our simple theme variables natively:

```css
@import "tailwindcss";

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;850&display=swap');

/* Configure custom theme variables in Tailwind v4 */
@theme {
  --font-sans: 'Inter', sans-serif;
  --font-display: 'Outfit', sans-serif;
  
  --color-brand-50: #f8fafc;
  --color-brand-100: #f1f5f9;
  --color-brand-200: #e2e8f0;
  --color-brand-500: #3b82f6; /* Modern Blue */
  --color-brand-600: #2563eb;
  --color-brand-950: #020617; /* Slate Black Background */
}

@layer base {
  body {
    background-color: var(--color-brand-950);
    color: var(--color-slate-200);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    min-height: 100vh;
  }
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
}
::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.4);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.6);
}
```

---

## 2. Secure Route Protection Shell

To build a reliable editor, we isolate private pages (the document list, active editor rooms) behind a clean authorization guard.

### Protected Route Wrapper Component (`src/components/Common/ProtectedRoute.jsx`)
Create `frontend/src/components/Common/ProtectedRoute.jsx` and add this logic:

```jsx
import React from 'react';
import { Navigate } from 'react-router';
import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-400">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
                    <span className="text-sm font-medium tracking-wide">Verifying session...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
```

---

## 3. Dynamic Error Pages (`src/components/Common/ErrorPage.jsx`)

To handle client and server anomalies, we introduce a unified, simple error viewport supporting three key HTTP states:
- **404 (Not Found)**: Unrecognized endpoints.
- **403 (Access Denied)**: Accessing protected resources without valid permissions.
- **500 (Server Error)**: System execution failures.

```jsx
import React from 'react';
import { useNavigate } from 'react-router';

const ErrorPage = ({ code = 404, message = "Page Not Found" }) => {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-slate-950 px-4 text-center">
            <div className="max-w-md rounded-lg border border-slate-800 bg-slate-900 p-8 shadow-sm">
                <h1 className="text-6xl font-bold tracking-tight text-slate-200">{code}</h1>
                <p className="mt-4 text-base text-slate-400">{message}</p>
                <div className="mt-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="rounded bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
                    >
                        Go back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
```

---

## 4. Client-Side Router Setup (`src/App.jsx`)

We assemble the visual mapping and coordinate user redirections inside `App.jsx`.

```jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import DocumentWorkspace from './components/Editor/DocumentWorkspace';
import ProtectedRoute from './components/Common/ProtectedRoute';
import ErrorPage from './components/Common/ErrorPage';
import useAuthStore from './store/store-placeholder';

function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <Router>
            <Routes>
                {/* Home redirection */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Secured Private Routes */}
                <Route 
                    path="/dashboard" 
                    element={<Navigate to="/dashboard/documents" replace />} 
                />
                <Route 
                    path="/dashboard/:tab" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/document/:id" 
                    element={
                        <ProtectedRoute>
                            <DocumentWorkspace />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Dedicated Error Routes */}
                <Route path="/403" element={<ErrorPage code={403} message="Forbidden. You do not have permission to view this resource." />} />
                <Route path="/500" element={<ErrorPage code={500} message="Internal Server Error. Something went wrong on our end." />} />
                
                {/* Fallback 404 Route */}
                <Route path="*" element={<ErrorPage code={404} message="The page you are looking for does not exist." />} />
            </Routes>
        </Router>
    );
}

export default App;
```

---

## 5. Reactive Forms with React Hook Form

To ensure performant user registration input validation, the `Register.jsx` component uses `react-hook-form` to track state, validate emails via regex patterns, and enforce password requirements before registration triggers.

---

## 6. Interactive Dashboard Navigation & Document Trash Recovery System

To deliver a premium MERN user experience, the dashboard layout provides tabbed page workspaces and a robust local recovery pipeline (trash bin) to prevent accidental data losses.

### Sidebar Navigation & Tab View Architecture (`src/components/Dashboard/Dashboard.jsx`)
We track the active sub-pane inside `Dashboard.jsx` using parameterized routing via `react-router`'s `useParams()` instead of simple local state. By listening to the URL (`/dashboard/:tab`), we conditionally render four distinct user panels and ensure tab selections persist across browser reloads:

1. **All Documents Tab (`documents`)**:
   * Houses your personal files.
   * Standard document deletion moves items into the Trash instead of erasing them permanently.
   * Linked Modal triggers the creation of new blank strategy sheets or code technical designs.

2. **Shared with Me Tab (`shared`)**:
   * Displays documents owned by other active team members in which the user is invited to collaborate.
   * Renders specialized collaborator badges and card headers.

3. **System Settings Tab (`settings`)**:
   * **Profile Management**: Displays editable name inputs and read-only email credentials.
   * **Visual Themes**: Interactive tiles to switch visual styles (Deep Obsidian, Classic Dark, Monochrome Slate).
   * **Document Preferences**: Interactive toggles to configure autosave behaviors and live collaborator presence bubbles.
   * **Save Alerts**: Confirms user adjustments with reactive green alert checkmarks.

4. **Trash Bin Tab (`trash`)**:
   * Houses items deleted from your personal workspace.
   * **Restore Action**: CCW-rotation trigger instantly transfers documents back to All Documents.
   * **Permanent Purge**: Permanently deletes specific trashing entries.
   * **Empty Trash**: Batch clears all deleted documents from the workspace at once.

### Local State Persistence Mapping
To enable full offline-first capabilities prior to server synchronization in Part 6, the dashboard coordinates state matrices using the following persistent `localStorage` keys:
- `mock_documents`: Personal documents array list.
- `mock_shared`: Team-collaborated documents array list.
- `mock_trash`: Safe-deleted documents array list.

This architecture ensures a fast, clean, and bulletproof user experience!

