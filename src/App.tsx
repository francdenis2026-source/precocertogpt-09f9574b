import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrecoCertoApp from "./PrecoCertoApp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<PrecoCertoApp />} />
      </Routes>
    </BrowserRouter>
  );
}
