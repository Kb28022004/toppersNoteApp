import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import AppRoute from "./routes/AppRoute";
import { Toaster } from "react-hot-toast";
import "./App.css";
import { useEffect } from "react";

const App = () => {
  return (
    <>
      <Router>
        <Toaster position="top-center" />
        <AppRoute />
      </Router>
    </>
  );
};

export default App;
