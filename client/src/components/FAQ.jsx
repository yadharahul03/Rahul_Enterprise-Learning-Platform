import { useState } from "react";

const faqs = [
  {
    q: "Do I need prior experience to start a route?",
    a: "No — most routes have a Beginner track that assumes nothing beyond basic computer literacy. Course pages show a difficulty badge so you can gauge fit before enrolling.",
  },
  {
    q: "How much time should I set aside each week?",
    a: "Most learners spend 4–6 hours a week and finish a route in 8–12 weeks. Everything is self-paced, so you can move faster or slower without losing progress.",
  },
  {
    q: "Will I get a certificate?",
    a: "Yes — once you complete all units in a course, a certificate is generated automatically and available from My Learning.",
  },
  {
    q: "Can I switch between routes?",
    a: "Absolutely. You can be enrolled in multiple courses at once, and your dashboard keeps track of progress on each independently.",
  },
  {
    q: "Is there any live instructor support?",
    a: "Scheduled live sessions and mentor check-ins appear on your Schedule page as they're announced for your enrolled courses.",
  },
];

function FaqItem({ item, open, onToggle }) {
  return (
    <div className={`faq-item ${open ? "is-open" : ""}`}>
      <button className="faq-question" onClick={onToggle}>
        <span>{item.q}</span>
        <span className="faq-chevron">&rsaquo;</span>
      </button>
      {open && <p className="faq-answer">{item.a}</p>}
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section faq">
      <div className="section-head">
        <p className="eyebrow">Before you set off</p>
        <h2>Frequently asked <em>questions</em></h2>
      </div>

      <div className="faq-list">
        {faqs.map((item, i) => (
          <FaqItem key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>

      <style>
        {`
          .faq-list { max-width: 720px; display: flex; flex-direction: column; gap: 10px; }
          .faq-item { background: var(--ridge); border: 1px solid var(--contour); border-radius: 16px; overflow: hidden; }
          .faq-question { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 1.1rem 1.4rem; background: transparent; border: none; color: var(--chalk); font-size: 0.95rem; font-weight: 600; text-align: left; }
          .faq-chevron { transition: transform 0.2s ease; font-size: 20px; color: var(--chalk-dim); transform: rotate(90deg); }
          .faq-item.is-open .faq-chevron { transform: rotate(-90deg); }
          .faq-answer { padding: 0 1.4rem 1.2rem; color: var(--chalk-dim); font-size: 0.88rem; line-height: 1.6; }
        `}
      </style>
    </section>
  );
}
