import './Contact.css'

const ADDRESS = '98 A Mabini, Malolos, Bulacan'
const PHONE = '09338681041'
const FB_URL = 'https://www.facebook.com/bulacanpagibighouseandlot/'
const MAP_EMBED_URL = 'https://maps.google.com/maps?q=14.865207,120.820608&z=16&output=embed'

export default function Contact() {
  return (
    <div className="contact-page">
      <section className="page-hero contact-hero">
        <div className="container">
          <h1 className="page-title">Contact Us</h1>
          <p className="page-subtitle">Get in touch. We're happy to help.</p>
        </div>
      </section>
      <section className="contact-content section">
        <div className="container contact-grid">
          <div className="contact-info">
            <h2 className="section-title">Address</h2>
            <p className="contact-text">{ADDRESS}</p>
            <h2 className="section-title">Phone</h2>
            <p className="contact-text">
              <a href={`tel:${PHONE.replace(/\s/g, '')}`}>{PHONE}</a>
            </p>
            <h2 className="section-title">Facebook</h2>
            <p className="contact-text">
              <a href={FB_URL} target="_blank" rel="noopener noreferrer">Visit our Facebook page</a>
            </p>
          </div>
          <div className="contact-map">
            <h2 className="section-title">Map</h2>
            <div className="map-wrap">
              <iframe
                title="Location map"
                src={MAP_EMBED_URL}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
