const routes = [
  {
    tier: 'Summit',
    title: 'Java Backend Developer',
    desc: 'Build production APIs, master Spring Security, and ship authenticated services end to end.',
    gain: '48h',
    distance: '12 modules',
    rating: '4.9',
    price: '240 TC',
    topics: ['Core Java & OOP', 'Spring Boot & REST APIs', 'Spring Security + JWT', 'MySQL & JPA/Hibernate', 'Testing with JUnit'],
    prereq: 'Basic programming knowledge',
    outcome: 'Ship a fully authenticated REST API from scratch',
  },
  {
    tier: 'Ridge',
    title: 'React Frontend Engineering',
    desc: 'Component architecture, state management, and interfaces that hold up under real traffic.',
    gain: '36h',
    distance: '9 modules',
    rating: '4.8',
    price: '180 TC',
    topics: ['React Fundamentals & Hooks', 'State Management', 'Routing with React Router', 'API Integration', 'Performance & Testing'],
    prereq: 'HTML, CSS, JavaScript basics',
    outcome: 'Build and deploy a production-grade React app',
  },
  {
    tier: 'Basecamp',
    title: 'Data Science Foundations',
    desc: 'Statistics, Python tooling, and the modelling instincts every analytics role expects.',
    gain: '30h',
    distance: '8 modules',
    rating: '4.7',
    price: '160 TC',
    topics: ['Python for Data Science', 'Statistics & Probability', 'Pandas & NumPy', 'Data Visualization', 'Intro to Machine Learning'],
    prereq: 'No prior experience needed',
    outcome: 'Analyze real datasets and build your first ML model',
  },
];

export default function Routes() {
  return (
    <section id="learn" className="section routes">
      <div className="section-head">
        <p className="eyebrow">Learn — charted routes</p>
        <h2>Pick your <em>route</em></h2>
        <p>Every course is a mapped route with a difficulty tier, distance, and elevation gain. Hover a card to see what's inside.</p>
      </div>

      <div className="routes-grid">
        {routes.map((r) => (
          <div className="route-box" key={r.title}>

            <div className="route-face route-front">
              <div className="route-card-top">
                <span className={`tier tier-${r.tier.toLowerCase()}`}>{r.tier}</span>
                <span className="rating">★ {r.rating}</span>
              </div>
              <h3>{r.title}</h3>
              <p className="grow">{r.desc}</p>
              <div className="route-stats">
                <div>
                  <span className="label">Elevation gain</span>
                  <span className="value">{r.gain}</span>
                </div>
                <div>
                  <span className="label">Distance</span>
                  <span className="value">{r.distance}</span>
                </div>
              </div>
              <div className="route-card-foot">
                <span className="price">{r.price}</span>
                <span className="go">Hover for details →</span>
              </div>
            </div>

            <div className="route-face route-back">
              <span className={`tier tier-${r.tier.toLowerCase()}`}>{r.tier}</span>
              <h3>{r.title}</h3>

              <span className="back-label">What you'll cover</span>
              <ul className="topic-list">
                {r.topics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>

              <div className="back-meta">
                <div>
                  <span className="back-label">Prerequisites</span>
                  <p>{r.prereq}</p>
                </div>
                <div>
                  <span className="back-label">Outcome</span>
                  <p>{r.outcome}</p>
                </div>
              </div>

              <div className="route-card-foot">
                <span className="price">{r.price}</span>
                <span className="go">Enter route →</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      <style>
        {`
          .routes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
          .route-box { position: relative; height: 420px; overflow: hidden; border: 1px solid var(--contour); background: var(--ridge); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); transition: border-color 0.25s ease, transform 0.25s ease; }
          .route-box:hover { border-color: rgba(124, 108, 246, 0.55); transform: translateY(-4px); box-shadow: var(--shadow-card), var(--shadow-glow); }
          .route-face { position: absolute; inset: 0; padding: 1.75rem; display: flex; flex-direction: column; box-sizing: border-box; }
          .route-front { opacity: 1; transition: opacity 0.25s ease; }
          .route-box:hover .route-front { opacity: 0; }
          .route-back { opacity: 0; pointer-events: none; transition: opacity 0.25s ease; overflow-y: auto; }
          .route-box:hover .route-back { opacity: 1; pointer-events: auto; }
          .route-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-shrink: 0; }
          .tier { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.32rem 0.7rem; border: 1px solid var(--sage); border-radius: 999px; color: var(--sage); display: inline-block; flex-shrink: 0; }
          .tier-summit { border-color: transparent; background: var(--gradient-primary); color: #fff; }
          .rating { font-family: var(--font-mono); font-size: 0.85rem; color: var(--chalk-dim); }
          .route-face h3 { font-family: var(--font-display); font-weight: 700; font-size: 1.35rem; letter-spacing: -0.01em; margin: 0.6rem 0; flex-shrink: 0; }
          .route-front h3 { margin-top: 0; }
          .route-face p { color: var(--chalk-dim); font-size: 0.9rem; margin: 0 0 1.25rem; }
          .grow { flex-grow: 1; }
          .route-stats { display: flex; gap: 2rem; border-top: 1px solid var(--contour); border-bottom: 1px solid var(--contour); padding: 1rem 0; margin-bottom: 1.25rem; flex-shrink: 0; }
          .route-stats .label { display: block; font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--chalk-dim); margin-bottom: 0.25rem; }
          .route-stats .value { font-family: var(--font-mono); font-size: 1rem; color: var(--chalk); }
          .route-card-foot { display: flex; justify-content: space-between; align-items: center; margin-top: auto; flex-shrink: 0; padding-top: 0.5rem; }
          .price { font-family: var(--font-mono); font-weight: 600; background: var(--gradient-text); -webkit-background-clip: text; background-clip: text; color: transparent; }
          .go { font-family: var(--font-body); font-size: 0.8rem; color: var(--chalk-dim); }
          .back-label { display: block; font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--sage); margin: 0.6rem 0 0.4rem; flex-shrink: 0; }
          .topic-list { list-style: none; padding: 0; margin: 0 0 0.25rem; flex-shrink: 0; }
          .topic-list li { color: var(--chalk-dim); font-size: 0.78rem; padding: 0.18rem 0 0.18rem 1rem; position: relative; line-height: 1.3; }
          .topic-list li::before { content: '—'; position: absolute; left: 0; color: var(--sage); }
          .back-meta { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.5rem; flex-shrink: 0; }
          .back-meta p { color: var(--chalk-dim); font-size: 0.78rem; margin: 0; line-height: 1.3; }
          @media (max-width: 900px) {
            .routes-grid { grid-template-columns: 1fr; }
            .route-box { height: 460px; }
          }
        `}
      </style>
    </section>
  );
}
