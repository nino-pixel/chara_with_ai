import { Link } from 'react-router-dom'
import { useInquiryLink, useMarketingLinkTo } from '../hooks/useMarketingLinkTo'
import './About.css'

export default function About() {
  const inquiryTo = useInquiryLink()
  const propertiesTo = useMarketingLinkTo('/properties')
  return (
    <div className="about-page">
      <section className="page-hero about-hero">
        <div className="container">
          <h1 className="page-title">About CHara Realty</h1>
          <p className="page-subtitle about-hero-lead">
            Straight answers, real listings, and local know-how in Central Luzon, without the hard sell.
          </p>
        </div>
      </section>

      <section className="about-content section">
        <div className="container about-inner">
          <div className="about-block">
            <h2 className="section-title">Background</h2>
            <p>
              CHara Realty started from a practical problem: people in{' '}
              <strong>Bulacan</strong> and nearby <strong>Pampanga</strong> needed a clearer way to find
              houses, lots, and condos, without wading through vague ads or listings that disappear when you
              call. We focus on residential property where families actually live and invest, and we work
              with developers and sellers who are ready to deal seriously.
            </p>
          </div>

          <div className="about-block">
            <h2 className="section-title">Mission</h2>
            <p>
              We help <strong>first-time buyers</strong>, <strong>families moving up</strong>, and{' '}
              <strong>investors</strong> compare real options with clear numbers and honest timelines. The
              goal isn’t to push the fastest sale. It’s for you to make a decision you can stand behind, from
              first question to keys in hand.
            </p>
          </div>

          <div className="about-block">
            <h2 className="section-title">Credibility</h2>
            <p>
              What you see on our site is vetted before it goes live: price, status, and availability should
              match what you’ll hear when you inquire. We don’t bury fees in the fine print. We’ll talk
              through what to budget, including the boring parts. Our edge is local: which areas are actually
              commutable, how subdivisions differ, and what financing paths people are using in the real
              world, not generic “market reports.”
            </p>
          </div>

          <div className="about-block about-block--why">
            <h2 className="section-title">Why choose us</h2>
            <ul className="about-why-grid">
              <li className="about-why-card">
                <h3 className="about-why-title">Verified listings only</h3>
                <p>
                  We don’t publish placeholder inventory or “call for price” ghosts. If it’s on the site, it’s
                  meant to be real and current.
                </p>
              </li>
              <li className="about-why-card">
                <h3 className="about-why-title">Clear pricing</h3>
                <p>
                  You get peso amounts and straight talk on what affects the total cost, so you’re not surprised
                  at the last step.
                </p>
              </li>
              <li className="about-why-card">
                <h3 className="about-why-title">Local market expertise</h3>
                <p>
                  We’re rooted in <strong>Bulacan</strong>, <strong>Pampanga</strong>, and surrounding{' '}
                  Central Luzon, not a distant call center reading a script.
                </p>
              </li>
              <li className="about-why-card">
                <h3 className="about-why-title">Guided buying process</h3>
                <p>
                  From inquiry to viewing to paperwork, you have a clear line of communication: questions answered,
                  next steps spelled out.
                </p>
              </li>
            </ul>
          </div>

          <div className="about-block about-block--how">
            <h2 className="section-title">How we work</h2>
            <ol className="about-how-steps" aria-label="How we work">
              <li className="about-how-step">
                <span className="about-how-num" aria-hidden>
                  1
                </span>
                <div>
                  <h3 className="about-how-title">You inquire</h3>
                  <p>Tell us your budget, timeline, and what matters: location, size, or payment style.</p>
                </div>
              </li>
              <li className="about-how-step">
                <span className="about-how-num" aria-hidden>
                  2
                </span>
                <div>
                  <h3 className="about-how-title">We match you with properties</h3>
                  <p>We shortlist what fits. Not every listing on the market, only what’s relevant to you.</p>
                </div>
              </li>
              <li className="about-how-step">
                <span className="about-how-num" aria-hidden>
                  3
                </span>
                <div>
                  <h3 className="about-how-title">We guide you until closing</h3>
                  <p>Viewings, questions, documents, and handover: we stay with you through the messy middle.</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="about-block about-block--approach">
            <h2 className="section-title">Our approach</h2>
            <p>
              We’re not here to rush you into a signature. Buying property is a big line item, and we get that. We
              return messages, explain trade-offs in plain language (bigger lot vs. shorter commute, bank loan
              vs. in-house), and let <em>you</em> choose. Our job is to make the path understandable, not to
              corner you into a “yes.” When you’re ready, we’re ready; until then, ask anything.
            </p>
          </div>
        </div>
      </section>

      <section className="about-cta section">
        <div className="container about-cta-inner">
          <h2 className="about-cta-title">Ready to find your property?</h2>
          <p className="about-cta-text">
            Browse what’s live, or send us a message. We’ll respond with next steps, not a sales script.
          </p>
          <div className="about-cta-actions">
            <Link to={propertiesTo} className="btn btn-primary btn-lg">
              Browse properties
            </Link>
            <Link to={inquiryTo} className="btn btn-outline btn-lg about-cta-btn-secondary">
              Send inquiry
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
