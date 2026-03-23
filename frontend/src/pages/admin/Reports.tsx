import './admin-common.css'
import './Reports.css'

export default function AdminReports() {
  return (
    <div className="admin-reports">
      <h1 className="admin-page-title">Reports</h1>
      <p className="admin-page-subtitle">Monthly leads, top properties, sales summary.</p>

      <section className="admin-report-section">
        <h2 className="admin-report-heading">Monthly leads</h2>
        <div className="admin-report-cards">
          <div className="admin-report-card">
            <span className="admin-report-value">12</span>
            <span className="admin-report-label">February 2026</span>
          </div>
          <div className="admin-report-card">
            <span className="admin-report-value">8</span>
            <span className="admin-report-label">January 2026</span>
          </div>
          <div className="admin-report-card">
            <span className="admin-report-value">15</span>
            <span className="admin-report-label">December 2024</span>
          </div>
        </div>
      </section>

      <section className="admin-report-section">
        <h2 className="admin-report-heading">Top properties (views / inquiries)</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Location</th>
                <th>Inquiries</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Greenfield Residence</td>
                <td>Bulacan</td>
                <td>5</td>
                <td><span className="admin-badge admin-badge--available">Available</span></td>
              </tr>
              <tr>
                <td>Solana Heights — Unit 4A</td>
                <td>Angeles City, Pampanga</td>
                <td>3</td>
                <td><span className="admin-badge admin-badge--available">Available</span></td>
              </tr>
              <tr>
                <td>Casa Verde — Unit B</td>
                <td>Pampanga</td>
                <td>2</td>
                <td><span className="admin-badge admin-badge--sold">Sold</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-report-section">
        <h2 className="admin-report-heading">Sales summary</h2>
        <div className="admin-report-cards">
          <div className="admin-report-card admin-report-card--highlight">
            <span className="admin-report-value">2</span>
            <span className="admin-report-label">Sold this month</span>
          </div>
          <div className="admin-report-card">
            <span className="admin-report-value">₱6,888,000</span>
            <span className="admin-report-label">Total sales (MTD)</span>
          </div>
        </div>
      </section>
    </div>
  )
}
