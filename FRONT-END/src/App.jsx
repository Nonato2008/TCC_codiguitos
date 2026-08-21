<<<<<<< HEAD
import Produtos from "./pages/produtos/produtos";

function App() {
    return (
        <Produtos />
    );
}

export default App;
=======
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
>>>>>>> a064cb4b9715c909259d3be1d48a9fb63ad919cc
