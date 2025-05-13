import Hero from "../sections/Hero";
import Features from "../sections/Features";
import About from "../sections/About";
import Counter from "../sections/Counter";
import Services from "../sections/Services";
import Gallery from "../sections/Gallery";
import Team from "../sections/Team";
import Testimonials from "../sections/Testimonials";
import Membership from "../sections/Membership";
import Calendar from "../sections/Calendar";
import Contact from "../sections/Contact";

const Home = () => {
  return (
    <>
      <Hero />
      <Features />
      <About />
      <Services />
      <Membership />
      <Calendar />
      <Gallery />
      <Team />
      <Counter />
      <Testimonials />
      <Contact />
    </>
  );
};

export default Home;
