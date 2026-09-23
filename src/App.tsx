import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
// PLACEHOLDER — hidden until real data exists. See the note in App() below.
// import ImpactCounters from './components/sections/ImpactCounters'
import OurWork from './components/sections/OurWork'
import DonateBlock from './components/sections/DonateBlock'
// import FieldStories from './components/sections/FieldStories'
import GetInvolved from './components/sections/GetInvolved'
// import Transparency from './components/sections/Transparency'
// import Partners from './components/sections/Partners'
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
        {/*
          PLACEHOLDER SECTIONS — commented out until real data exists. Each one
          displays invented figures or names as fact. To restore a section,
          uncomment it here AND its import above.
            ImpactCounters — IMPACT_STATS (1,850 housed, 24,000 rides…) are invented.
                             Restoring it: also restore the Impact nav link in
                             content.ts and the "See Our Impact" hero button.
            FieldStories   — its only card is the placeholder Recovery Picnic post.
            Transparency   — the 89/7/4 budget split and four dead document links.
                             The charitable-purpose statement it held is still on
                             /what-we-do.
            Partners       — all six supporter names are invented.
        */}
        {/* <ImpactCounters /> */}
        <OurWork />
        <DonateBlock />
        {/* <FieldStories /> */}
        <GetInvolved />
        {/* <Transparency /> */}
        {/* <Partners /> */}
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}

export default App
