const instruments = [
  {
    icon: '◉',
    name: 'Skill Tracking',
    reading: '12 SKILLS ACTIVE',
    desc: 'Every module logged against a live skill inventory.',
    detail: 'Every lesson, quiz, and project you complete updates a live map of your abilities — so you always know exactly which skills are strong and which need more altitude.',
  },
  {
    icon: '▤',
    name: 'Analytics Dashboard',
    reading: '82% COMPLETION',
    desc: 'A instrument-panel view of pace, gaps, and momentum.',
    detail: 'A single dashboard shows your pace against the route, where you\'re falling behind, and which topics are consuming the most time — like a cockpit readout for your learning.',
  },
  {
    icon: '⬡',
    name: 'Certificates',
    reading: 'VERIFIED ON ISSUE',
    desc: 'Signed proof of route completion, ready to share.',
    detail: 'Each completed route issues a signed, verifiable certificate — shareable on LinkedIn or with recruiters, with a unique ID that confirms it\'s genuine.',
  },
  {
    icon: '➤',
    name: 'AI Recommendations',
    reading: 'NEXT: RIDGE TIER',
    desc: 'Suggests the next route based on where you stand.',
    detail: 'Based on your completed routes and skill gaps, the system recommends what to climb next — so you\'re never guessing which course actually moves you forward.',
  },
];

export default function Instruments() {
  return (
    <section id="track" className="section instruments">
      <div className="section-head">
        <p className="eyebrow">Track — basecamp instruments</p>
        <h2>Read your <em>progress</em></h2>
        <p>Four instruments, always mounted at basecamp, telling you exactly where you stand on the climb. Hover a dial for the full reading.</p>
      </div>

      <div className="instruments-grid">
        {instruments.map((inst) => (
          <div className="inst-box" key={inst.name}>

            <div className="inst-face inst-front">
              <div className="instrument-dial" aria-hidden="true">{inst.icon}</div>
              <h3>{inst.name}</h3>
              <p className="grow">{inst.desc}</p>
              <span className="reading">{inst.reading}</span>
            </div>

            <div className="inst-face inst-back">
              <div className="instrument-dial small" aria-hidden="true">{inst.icon}</div>
              <h3>{inst.name}</h3>
              <p className="detail-text">{inst.detail}</p>
            </div>

          </div>
        ))}
      </div>

      <style>
        {`
          .instruments-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.1rem; }
          .inst-box { position: relative; height: 300px; overflow: hidden; background: var(--ridge); border: 1px solid var(--contour); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); transition: border-color 0.25s ease, transform 0.25s ease; }
          .inst-box:hover { border-color: rgba(124, 108, 246, 0.5); transform: translateY(-4px); }
          .inst-face { position: absolute; inset: 0; padding: 2.1rem 1.6rem; display: flex; flex-direction: column; box-sizing: border-box; }
          .inst-front { opacity: 1; transition: opacity 0.25s ease; }
          .inst-box:hover .inst-front { opacity: 0; }
          .inst-back { opacity: 0; pointer-events: none; transition: opacity 0.25s ease; background: var(--ridge); overflow-y: auto; }
          .inst-box:hover .inst-back { opacity: 1; pointer-events: auto; }
          .instrument-dial { width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: #fff; font-size: 1.2rem; margin-bottom: 1.5rem; flex-shrink: 0; box-shadow: 0 4px 16px rgba(124, 108, 246, 0.35); }
          .instrument-dial.small { width: 2.2rem; height: 2.2rem; font-size: 1rem; margin-bottom: 1rem; }
          .inst-face h3 { font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; letter-spacing: -0.01em; margin-bottom: 0.6rem; flex-shrink: 0; }
          .inst-face p { color: var(--chalk-dim); font-size: 0.88rem; margin: 0; }
          .grow { flex-grow: 1; }
          .detail-text { font-size: 0.82rem; line-height: 1.5; flex-grow: 1; color: var(--chalk-dim); }
          .reading { display: block; font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.06em; color: var(--sage); border-top: 1px solid var(--contour); padding-top: 0.9rem; margin-top: auto; flex-shrink: 0; }
          @media (max-width: 900px) {
            .instruments-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 560px) {
            .instruments-grid { grid-template-columns: 1fr; }
            .inst-box { height: 320px; }
          }
        `}
      </style>
    </section>
  );
}
