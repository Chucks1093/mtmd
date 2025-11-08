import './app.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import AdminLogin from './pages/Login';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import OAuthCallback from './pages/OAuthCallback';
const router = createBrowserRouter([
	{
		path: '/',
		element: <div>My App</div>,
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
		<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
			<Toaster />
			<RouterProvider router={router} />
		</GoogleOAuthProvider>
	);
}

export default App;
