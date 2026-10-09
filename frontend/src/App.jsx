import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ProtectedRoute from './components/admin/ProtectedRoute'
import RequireAuth from './components/RequireAuth'
import useGetSavedJobs from './hooks/useGetSavedJobs'
import useGetAppliedJobs from './hooks/useGetAppliedJobs'

const Login = lazy(() => import('./components/auth/Login'))
const Signup = lazy(() => import('./components/auth/Signup'))
const Home = lazy(() => import('./components/Home'))
const Jobs = lazy(() => import('./components/Jobs'))
const Browse = lazy(() => import('./components/Browse'))
const Profile = lazy(() => import('./components/Profile'))
const JobDescription = lazy(() => import('./components/JobDescription'))
const Companies = lazy(() => import('./components/admin/Companies'))
const CompanyCreate = lazy(() => import('./components/admin/CompanyCreate'))
const CompanySetup = lazy(() => import('./components/admin/CompanySetup'))
const AdminJobs = lazy(() => import('./components/admin/AdminJobs'))
const PostJob = lazy(() => import('./components/admin/PostJob'))
const Applicants = lazy(() => import('./components/admin/Applicants'))
const NotFound = lazy(() => import('./components/NotFound'))
const CandidateDashboard = lazy(() => import('./components/CandidateDashboard'))
const RecruiterDashboard = lazy(() => import('./components/admin/RecruiterDashboard'))

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: "/jobs",
    element: <Jobs />
  },
  {
    path: "/description/:id",
    element: <JobDescription />
  },
  {
    path: "/browse",
    element: <Browse />
  },
  {
    path: "/profile",
    element: <RequireAuth><Profile /></RequireAuth>
  },
  {
    path: "/dashboard",
    element: <RequireAuth><CandidateDashboard /></RequireAuth>
  },
  // admin ke liye yha se start hoga
  {
    path:"/admin/companies",
    element: <ProtectedRoute><Companies/></ProtectedRoute>
  },
  {
    path:"/admin/dashboard",
    element: <ProtectedRoute><RecruiterDashboard /></ProtectedRoute>
  },
  {
    path:"/admin/companies/create",
    element: <ProtectedRoute><CompanyCreate/></ProtectedRoute> 
  },
  {
    path:"/admin/companies/:id",
    element:<ProtectedRoute><CompanySetup/></ProtectedRoute> 
  },
  {
    path:"/admin/jobs",
    element:<ProtectedRoute><AdminJobs/></ProtectedRoute> 
  },
  {
    path:"/admin/jobs/create",
    element:<ProtectedRoute><PostJob/></ProtectedRoute> 
  },
  {
    path:"/admin/jobs/:id/edit",
    element:<ProtectedRoute><PostJob/></ProtectedRoute>
  },
  {
    path:"/admin/jobs/:id/applicants",
    element:<ProtectedRoute><Applicants/></ProtectedRoute> 
  },
  {
    path: "*",
    element: <NotFound />
  },

])
function App() {
  useGetSavedJobs();
  useGetAppliedJobs();

  return (
    <div>
      <Suspense fallback={<div className="min-h-screen bg-gray-50 animate-pulse" aria-label="Loading page" />}>
        <RouterProvider router={appRouter} />
      </Suspense>
    </div>
  )
}

export default App
