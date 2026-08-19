import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import ImpactCounters from './components/sections/ImpactCounters'
import OurWork from './components/sections/OurWork'
import DonateBlock from './components/sections/DonateBlock'
import FieldStories from './components/sections/FieldStories'
import GetInvolved from './components/sections/GetInvolved'
import Transparency from './components/sections/Transparency'
import Partners from './components/sections/Partners'
import Newsletter from './components/sections/Newsletter'

/**
 * Housing Support Rides — single-page site.
 * Sections render top-to-bottom; the navbar links are in-page anchors.
 */
function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ImpactCounters />
        <OurWork />
        <DonateBlock />
        <FieldStories />
        <GetInvolved />
        <Transparency />
        <Partners />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}

export default App
