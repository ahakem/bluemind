import Hero from "../sections/Hero";
import Features from "../sections/Features";
import About from "../sections/About";
import Counter from "../sections/Counter";
import Services from "../sections/Services";
import Membership from "../sections/Membership";
import Calendar from "../sections/Calendar";
import Contact from "../sections/Contact";

const Home = () => {
  return (
    <>
      <Hero />
      {/* <Features /> */}
      {/* <Services /> */}
      <About />

      <Membership />

      <Calendar /> 
      {/* <Counter /> */}
      <Contact />
    </>
  );
};

export default Home;
