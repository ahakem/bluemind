import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../sections/Hero";
import About from "../sections/About";
import Membership from "../sections/Membership";
import Calendar from "../sections/Calendar";
import Contact from "../sections/Contact";
import Team from "../sections/Team";
import Gallery from "../sections/Gallery";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const element = document.querySelector(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location]);

  return (
    <>
      <Hero />
      <About />
      <Team />
      <Membership />
      <Gallery />
      <Calendar />
      <Contact />
    </>
  );
};

export default Home;