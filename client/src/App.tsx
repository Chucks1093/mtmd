import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import AdminLogin from './pages/Login';
import { Toaster } from 'react-hot-toast';
import OAuthCallback from './pages/OAuthCallback';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './pages/DashboardLayout';
import { adminLoader, loginPageLoader } from './helpers/admin.loader';
import Reports from './pages/Reports';
import ReportDetails from './pages/ReportDetails';
import Admins from './pages/Admins';
import AcceptInvite from './pages/AcceptInvite';
import DashboardOverview from './pages/DashboardOverview';
import Donations from './pages/Donations';
import Partners from './pages/Partners';
import DonationCallback from './components/landing-page/DonationCallback';

const router = createBrowserRouter([
	{
		path: '/',
		element: <LandingPage />,
	},
	{
		path: '/donation/callback',
		element: <DonationCallback />,
	},
	{
		path: '/admin/auth',
		loader: loginPageLoader,
		element: <AdminLogin />,
	},
	{
		path: '/admin/auth/callback',
		element: <OAuthCallback />,
	},
	{
		path: '/admin/invite/:token',
		element: <AcceptInvite />,
	},
	{
		path: '/admin/dashboard',
		loader: adminLoader,
		element: <DashboardLayout />,
		children: [
			{
				index: true, // Use index instead of empty path
				element: <DashboardOverview />,
			},
			{
				path: 'reports', // Remove '/admin/dashboard' prefix
				element: <Reports />,
			},
			{
				path: 'admins',
				element: <Admins />,
			},
			{
				path: 'reports/:id',
				element: <ReportDetails />,
			},
			{
				path: 'donations',
				element: <Donations />,
			},
			{
				path: 'partners',
				element: <Partners />,
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
