import { Routes, Route } from "react-router-dom";
import "./App.css";
import GameRoom from "./components/GameRoom.jsx";
import TermsOfService from "./components/TermsOfService.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<GameRoom />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>
  );
}

export default App;
