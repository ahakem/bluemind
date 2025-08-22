import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../sections/Hero";
import About from "../sections/About";
import Membership from "../sections/Membership";
import Calendar from "../sections/Calendar";
import Contact from "../sections/Contact";
import Team from "../sections/Team";
import Gallery from "../sections/Gallery";
import { Helmet } from "react-helmet-async";

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
      <Helmet>
        <title>Blue Mind Freediving Amsterdam | Professional Freediving Training</title>
        <meta
          name="description"
          content="Blue Mind Freediving offers professional freediving training in Amsterdam. Join our pool sessions led by certified instructors and national record holders."
        />
        <meta name="keywords" content="freediving, Amsterdam, pool training, breath-hold, freediving club, freediving lessons" />
        <meta property="og:title" content="Blue Mind Freediving Amsterdam" />
        <meta property="og:description" content="Professional freediving training in Amsterdam with certified instructors and national record holders." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bluemindfreediving.nl" />
        <meta property="og:image" content="https://bluemindfreediving.nl/og-image.jpg" />
        <link rel="canonical" href="https://bluemindfreediving.nl" />
      </Helmet>

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
