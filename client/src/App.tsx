import './app.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import AdminLogin from './pages/Login';
import { Toaster } from 'react-hot-toast';
import OAuthCallback from './pages/OAuthCallback';
import LandingPage from './pages/LandingPage';

const router = createBrowserRouter([
	{
		path: '/',
		element: <LandingPage />,
	},
	{
		path: '/admin',
		children: [
			{
				path: '/admin/auth',
				element: <AdminLogin />,
			},
			{
				path: '/admin/auth/callback',
				element: <OAuthCallback />,
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
