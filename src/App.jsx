import { HashRouter as Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Navbar from "./layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Error from "./pages/Error";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import Config from "./pages/Config";
import Profile from "./pages/Profile";
import Resellers from "./pages/Resellers";
import Giveaways from "./pages/Giveaways";
import { authUse } from "./context/AuthContext";
import Loader from "./context/Loader";
import { useState } from "react";
import GiveawayResult from "./pages/GiveawayResult";

function App() {
  const { isAdmin, isLogged } = authUse();
  const [formData, setFormData] = useState({
    id_number: "",
    id_type: "",
    first_name: "",
    last_name: "",
    email: "",
    birth_date: "",
    gender: "",
    place: "",
    phone: "",
    address: "",
  });

  const handleButtonClick = (data) => {
    console.log("Data received in handleButtonClick:", data);

    // Actualiza el estado con la información recibida del botón
    setFormData((prevFormData) => ({
      ...prevFormData,
      id_number: data.id_number || "",
      id_type: data.id_type || "",
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      email: data.email || "",
      birth_date: data.birth_date || "",
      gender: data.gender || "",
      place: data.place || "",
      phone: data.phone || "",
      address: data.address || "",
    }));
  };

  return (
    <Loader>
      <section>
        <Navbar />
        {isLogged ? (
          isAdmin ? (
            <Routes>
              <Route path="/" element={<SignIn />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/home" element={<Banner />} />
              <Route
                path="/register"
                element={<Register formData={formData} />}
              />
              <Route
                path="/edit_profile"
                element={<Register formData={formData} />}
              />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/giveaway_results" element={<GiveawayResult />} />
              <Route path="/all_tickets" element={<Dashboard />} />
              <Route
                path="/resellers"
                element={<Resellers onClickButton={handleButtonClick} />}
              />
              <Route path="/config" element={<Config />} />
              <Route path="/giveaways" element={<Giveaways />} />
              <Route path="/not_found" element={<Error />} />
              <Route path="*" element={<Error />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Banner />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/home" element={<Banner />} />
              <Route
                path="/edit_profile"
                element={<Register formData={formData} />}
              />
              <Route path="/all_tickets" element={<Dashboard />} />
              <Route path="/not_found" element={<Error />} />
              <Route path="*" element={<Error />} />
            </Routes>
          )
        ) : (
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/not_found" element={<SignIn />} />
            <Route path="*" element={<SignIn />} />
          </Routes>
        )}
        <Footer />
      </section>
    </Loader>
  );
}

export default App;
