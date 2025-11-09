import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import AdminLogin from './pages/Login';
import { Toaster } from 'react-hot-toast';
import OAuthCallback from './pages/OAuthCallback';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './pages/DashboardLayout';
import { adminLoader } from './helpers/admin.loader';
import Reports from './pages/Reports';
import ReportDetails from './pages/ReportDetails';

const router = createBrowserRouter([
	{
		path: '/',
		element: <LandingPage />,
	},
	{
		path: '/admin/auth',
		element: <AdminLogin />,
	},
	{
		path: '/admin/auth/callback',
		element: <OAuthCallback />,
	},
	{
		path: '/admin/dashboard',
		loader: adminLoader,
		element: <DashboardLayout />,
		children: [
			{
				element: <Reports />,
				index: true,
			},
			{
				path: '/admin/dashboard/reports',
				element: <Reports />,
			},
			{
				path: '/admin/dashboard/reports/:id',
				element: <ReportDetails />,
			},
		],
	},
]);

function App() {
	return (
		<>
			<Toaster />
			<RouterProvider router={router} />
		</>
	);
}

export default App;
