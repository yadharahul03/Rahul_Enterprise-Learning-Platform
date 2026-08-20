const stats = [
  { label: 'Total expeditions', value: '1,847', delta: '+23%' },
  { label: 'Summit rate', value: '82%', delta: '+5.2%' },
  { label: 'Climbers active', value: '1,234', delta: '+12%' },
];

const profile = [
  { skill: 'Java', h: 68 },
  { skill: 'Py', h: 54 },
  { skill: 'React', h: 92 },
  { skill: 'SQL', h: 40 },
  { skill: 'AWS', h: 74 },
  { skill: 'K8s', h: 61 },
];

export default function TrailLog() {
  return (
    <section id="analytics" className="section trail-log">
      <div className="section-head">
        <p className="eyebrow">Analytics — the trail log</p>
        <h2>Every climb, <em>logged</em></h2>
        <p>A running logbook of who's climbing, how far they've gotten, and which skills are gaining the most ground.</p>
      </div>

      <div className="log-layout">
        <div className="log-stats">
          {stats.map((s) => (
            <div className="log-entry" key={s.label}>
              <span className="log-label">{s.label}</span>
              <div className="log-row">
                <span className="log-value">{s.value}</span>
                <span className="log-delta">↑ {s.delta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="elevation-panel">
          <span className="panel-title">Skill elevation profile</span>
          <div className="elevation-chart">
            {profile.map((p) => (
              <div className="bar-wrap" key={p.skill}>
                <div className="bar" style={{ height: `${p.h}%` }} />
                <span className="bar-label">{p.skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .log-layout {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 1.5rem;
        }
        .log-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .log-entry {
          position: relative;
          background: var(--ridge);
          border: 1px solid var(--contour);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-radius: var(--radius-md);
          padding: 1.5rem 1.75rem 1.5rem 2rem;
          box-shadow: var(--shadow-card);
          overflow: hidden;
        }
        .log-entry::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--gradient-primary);
        }
        .log-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--chalk-dim);
        }
        .log-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-top: 0.5rem;
        }
        .log-value {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 2.4rem;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .log-delta {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--sage);
        }
        .elevation-panel {
          background: var(--ridge);
          border: 1px solid var(--contour);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-card);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
        }
        .panel-title {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--chalk-dim);
          margin-bottom: 1.75rem;
        }
        .elevation-chart {
          flex: 1;
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          min-height: 220px;
        }
        .bar-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
        }
        .bar {
          width: 100%;
          background: linear-gradient(180deg, var(--violet), var(--orange) 55%, var(--sage));
          border-radius: 6px 6px 2px 2px;
          transition: filter 0.2s ease;
        }
        .bar-wrap:hover .bar {
          filter: brightness(1.2);
        }
        .bar-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--chalk-dim);
          margin-top: 0.6rem;
        }
        @media (max-width: 860px) {
          .log-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
