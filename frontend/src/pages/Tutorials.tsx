import { Link } from 'react-router-dom'
import type { To } from 'react-router-dom'
import { useMemo } from 'react'
import { useInquiryLink, useMarketingLinkTo } from '../hooks/useMarketingLinkTo'
import './Tutorials.css'

type TutorialLinks = {
  propertiesTo: To
  inquiryTo: To
  aboutTo: To
  contactTo: To
}

function getSteps(links: TutorialLinks) {
  const { propertiesTo, inquiryTo, aboutTo, contactTo } = links
  return [
    {
      title: 'Start on Home',
      body: (
        <>
          The home page highlights <strong>featured properties</strong> you can explore right away. Type a place name, listing title, or kind of home in the search box, then press{' '}
          <strong>Enter</strong> or tap <strong>Browse Properties</strong> to see matching homes on the Properties page.
        </>
      ),
    },
    {
      title: 'Browse & filter listings',
      body: (
        <>
          On <Link to={propertiesTo}>Properties</Link>, combine the search box with the filters: type of home, whether it&apos;s available, price range, and how you want results sorted (newest first or by price). You can save the page in your browser if you want to come back to the same search later. If you see too few results, try loosening a filter or clearing the search and starting again.
        </>
      ),
    },
    {
      title: 'Open a property',
      body: (
        <>
          Tap or click a listing to open its full page. There you&apos;ll find photos (and more images in the gallery when we have them), price, home type, status, a short description, and useful details like developer, how you can pay, and size. Sensitive seller or legal information is kept off the public page. When you&apos;re ready, use <strong>Inquire Now</strong> to go straight to the inquiry form.
        </>
      ),
    },
    {
      title: 'Send an inquiry',
      body: (
        <>
          On a property page, enter your name, email, phone (for Philippine numbers, use 11 digits starting with 09), and your message, then send. You&apos;ll get an on-screen confirmation. We try to reply within one business day. If you&apos;re not looking at one specific home yet, you can also send a general message from the{' '}
          <Link to={inquiryTo}>Inquire</Link> page.
        </>
      ),
    },
    {
      title: 'Learn more & reach us',
      body: (
        <>
          Visit <Link to={aboutTo}>About</Link> to learn who we are, and <Link to={contactTo}>Contact</Link> for phone, email, or other ways to reach us. Everything you need as a buyer is in the menu at the top of the site. You don&apos;t need an account to browse or send an inquiry.
        </>
      ),
    },
  ]
}

export default function Tutorials() {
  const inquiryTo = useInquiryLink()
  const propertiesTo = useMarketingLinkTo('/properties')
  const aboutTo = useMarketingLinkTo('/about')
  const contactTo = useMarketingLinkTo('/contact')
  const homeTo = useMarketingLinkTo('/')
  const steps = useMemo(
    () => getSteps({ propertiesTo, inquiryTo, aboutTo, contactTo }),
    [propertiesTo, inquiryTo, aboutTo, contactTo]
  )

  return (
    <div className="tutorials-page">
      <section className="page-hero tutorials-hero">
        <div className="container">
          <h1 className="page-title">How to use our website</h1>
          <p className="page-subtitle">
            Short steps for searching listings, viewing details, and sending inquiries. No account required.
          </p>
        </div>
      </section>
      <section className="tutorials-content section">
        <div className="container tutorials-inner">
          <ol className="tutorial-steps">
            {steps.map((step, i) => (
              <li key={step.title} className="tutorial-step">
                <span className="tutorial-step-num" aria-hidden>
                  {i + 1}
                </span>
                <div className="tutorial-step-body">
                  <h2 className="section-title tutorial-step-title">{step.title}</h2>
                  <div className="tutorial-step-text">{step.body}</div>
                </div>
              </li>
            ))}
          </ol>
          <p className="tutorials-cta">
            <Link to={propertiesTo} className="btn btn-primary">
              Go to Properties
            </Link>
            <Link to={homeTo} className="btn btn-outline">
              Back to Home
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
