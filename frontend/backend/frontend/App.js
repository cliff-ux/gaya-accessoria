import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup'; // Assuming Signup.js is in a 'components' folder
import Login from './components/Login';   // Assuming Login.js is in a 'components' folder
import Home from './components/Home';     // Example of another component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Example home route */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        {/* Add other routes for your application here */}
      </Routes>
    </Router>
  );
}

export default App;