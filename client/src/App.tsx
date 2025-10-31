import './app.css';
import { createBrowserRouter, RouterProvider } from 'react-router';

const router = createBrowserRouter([
   {
      path: '/',
      element: <div>My App</div>,
   },
]);

function App() {
   return (
      <>
         <RouterProvider router={router} />
      </>
   );
}

export default App;
