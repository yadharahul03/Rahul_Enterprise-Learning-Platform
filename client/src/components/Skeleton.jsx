// Shimmering placeholder blocks used while pages fetch real data, instead
// of a plain "Loading..." string.

export function SkeletonBar({ width = "100%", height = 14, style = {} }) {
  return <div className="ss-skel" style={{ width, height, ...style }} />;
}

export function SkeletonCard() {
  return (
    <div className="ss-skel-card">
      <SkeletonBar width="60%" height={12} />
      <SkeletonBar width="85%" height={18} style={{ marginTop: 10 }} />
      <SkeletonBar width="100%" height={6} style={{ marginTop: 14, borderRadius: 4 }} />
      <SkeletonBar width="40%" height={12} style={{ marginTop: 10 }} />
    </div>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="ss-skel-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
      <style>
        {`
          .ss-skel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
          .ss-skel-card { background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 16px; padding: 16px 18px; }
          .ss-skel { border-radius: 6px; background: linear-gradient(90deg, var(--st-track) 25%, var(--st-border) 37%, var(--st-track) 63%); background-size: 400% 100%; animation: ss-shimmer 1.4s ease infinite; }
          @keyframes ss-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
        `}
      </style>
    </div>
  );
}
