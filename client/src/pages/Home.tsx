import Hero from "../sections/Hero";
import Features from "../sections/Features";
import About from "../sections/About";
import Counter from "../sections/Counter";
import Services from "../sections/Services";
import Membership from "../sections/Membership";
import Calendar from "../sections/Calendar";
import Contact from "../sections/Contact";
import Team from "../sections/Team";
import Gallery from "../sections/Gallery";

const Home = () => {
  return (
    <>
      <Hero />
      {/* <Features /> */}
      {/* <Services /> */}
      <About />
      <Team />
      <Membership />
      <Gallery />
      <Calendar />
      {/* <Counter /> */}
      <Contact />
    </>
  );
};

export default Home;