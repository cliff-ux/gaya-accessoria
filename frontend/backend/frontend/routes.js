import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: "/",

    element: <Home />,
    
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  // Add other routes here
]);

export default router;