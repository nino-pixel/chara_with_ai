import { useEffect, useRef } from 'react'
import './Contact.css'

const ADDRESS = '98 A Mabini, Malolos, Bulacan'
const PHONE = '09338681041'
const FB_URL = 'https://www.facebook.com/bulacanpagibighouseandlot/'
const MAP_EMBED_URL = 'https://maps.google.com/maps?q=14.865207,120.820608&z=16&output=embed'

export default function Contact() {
  const robotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!robotRef.current) return
      
      const { clientX, clientY } = e
      const rect = robotRef.current.getBoundingClientRect()
      
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = clientX - centerX
      const deltaY = clientY - centerY
      
      // Calculate eye pupil movement distance
      const angle = Math.atan2(deltaY, deltaX)
      const maxDistance = 8 // bounds for the inner pupil
      const distance = Math.min(Math.hypot(deltaX, deltaY) / 15, maxDistance)
      
      const pupilX = Math.cos(angle) * distance
      const pupilY = Math.sin(angle) * distance
      
      // 3D rotation of the robot head (max 20 degrees)
      const rotateX = -(deltaY / window.innerHeight) * 40
      const rotateY = (deltaX / window.innerWidth) * 40
      
      robotRef.current.style.setProperty('--pupil-x', `${pupilX}px`)
      robotRef.current.style.setProperty('--pupil-y', `${pupilY}px`)
      robotRef.current.style.setProperty('--rotate-x', `${rotateX}deg`)
      robotRef.current.style.setProperty('--rotate-y', `${rotateY}deg`)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

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

            <div className="robot-wrapper">
              <div className="robot-container">
                <div className="robot-head" ref={robotRef}>
                  <div className="robot-ear left"></div>
                  <div className="robot-ear right"></div>
                  <div className="robot-face">
                    <div className="robot-eyes">
                      <div className="robot-eye left">
                        <div className="robot-pupil"></div>
                      </div>
                      <div className="robot-eye right">
                        <div className="robot-pupil"></div>
                      </div>
                    </div>
                    <div className="robot-mouth"></div>
                  </div>
                </div>
              </div>
            </div>
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
