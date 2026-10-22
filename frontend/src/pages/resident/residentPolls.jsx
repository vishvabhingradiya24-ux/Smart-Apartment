import "../../css/resident/residentPolls.css";

const ResidentPolls = () => (
  <div className="resident-polls-page">
    <header className="resident-polls-header">
      <div>
        <span className="resident-polls-overline">COMMUNITY</span>
        <h1>Polls &amp; Voting</h1>
        <p>Share your opinion on active community decisions.</p>
      </div>
    </header>

    <section className="resident-polls-empty">
      <div className="resident-polls-empty-icon" aria-hidden="true">✓</div>
      <span>COMMUNITY POLLS</span>
      <h2>No active polls</h2>
      <p>
        There are no community polls available right now. Published polls will
        appear here when they are opened for voting.
      </p>
    </section>
  </div>
);

export default ResidentPolls;
