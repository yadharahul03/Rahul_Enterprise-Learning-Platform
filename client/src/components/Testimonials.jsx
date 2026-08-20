const testimonials = [
  {
    quote: "I went from writing my first React component to shipping a full app in ten weeks. The projects felt real, not toy exercises.",
    name: "Ananya Rao",
    role: "Frontend Engineer, hired via cohort 03",
    initials: "AR",
  },
  {
    quote: "The pacing worked around my job. I'd do a unit on my commute and a project on weekends — six months later I switched into backend.",
    name: "Kevin Suarez",
    role: "Backend Developer",
    initials: "KS",
  },
  {
    quote: "What sold me was the analytics — actually seeing my skill elevation climb week over week kept me coming back.",
    name: "Meera Iyer",
    role: "Data Analyst",
    initials: "MI",
  },
];

export default function Testimonials() {
  return (
    <section className="section testimonials">
      <div className="section-head">
        <p className="eyebrow">Trail reports</p>
        <h2>Climbers who <em>made it</em></h2>
        <p>Real routes, real outcomes — a few notes from people who started where you are now.</p>
      </div>

      <div className="testimonial-grid">
        {testimonials.map((t) => (
          <div className="testimonial-card glass-panel" key={t.name}>
            <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
            <div className="testimonial-person">
              <div className="testimonial-avatar">{t.initials}</div>
              <div>
                <p className="testimonial-name">{t.name}</p>
                <p className="testimonial-role">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>
        {`
          .testimonial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; }
          .testimonial-card { padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between; min-height: 220px; transition: transform 0.2s ease, border-color 0.2s ease; }
          .testimonial-card:hover { transform: translateY(-4px); border-color: rgba(124, 108, 246, 0.35); }
          .testimonial-quote { font-size: 0.95rem; line-height: 1.6; color: var(--chalk); }
          .testimonial-person { display: flex; align-items: center; gap: 0.7rem; margin-top: 1.5rem; }
          .testimonial-avatar { width: 38px; height: 38px; flex-shrink: 0; border-radius: 50%; background: var(--gradient-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
          .testimonial-name { font-size: 0.85rem; font-weight: 600; }
          .testimonial-role { font-size: 0.75rem; color: var(--chalk-dim); margin-top: 1px; }
        `}
      </style>
    </section>
  );
}
