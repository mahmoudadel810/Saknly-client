import HeroSection from "@/components/Home/HeroSection";
import FeaturedProperties from "@/components/Home/FeaturedProperties";
import HowItWorks from "@/components/Home/HowItWorks";
import FeaturedAgencies from "@/components/Home/FeaturedAgencies";
import Testimonials from "@/components/Home/Testimonials";
import ListProperty from "@/components/Home/ListProperty";

/**
 * Home: start a search. The hero is the search form; below it the most viewed listings, how the site works,
 * agencies, testimonials (all from the API, approved only) and one "list your property" band.
 */
export default function Home() {
  return (
    <main id="main">
      <HeroSection />
      <FeaturedProperties />
      <HowItWorks />
      <FeaturedAgencies />
      <Testimonials />
      <ListProperty />
    </main>
  );
}
