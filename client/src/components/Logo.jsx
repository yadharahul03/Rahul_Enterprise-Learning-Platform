export default function Logo({ width = 36, height = 36, animated = false }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animated ? "ss-logo-animated" : "ss-logo-static"}
    >
      <defs>
        <linearGradient id="ssGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C6CF6" />
          <stop offset="50%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="ssGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#7C6CF6" />
        </linearGradient>
        <filter id="ssGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Orbital Ring */}
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke="url(#ssGrad1)"
        strokeWidth="3.5"
        strokeDasharray="180 60"
        filter="url(#ssGlow)"
        className="ss-logo-ring-outer"
      />

      {/* Inner Interlocking Nexus Orbital */}
      <ellipse
        cx="50"
        cy="50"
        rx="36"
        ry="16"
        stroke="url(#ssGrad2)"
        strokeWidth="3"
        transform="rotate(-30 50 50)"
        className="ss-logo-ring-inner"
      />

      {/* Center Core Glowing Sphere */}
      <circle cx="50" cy="50" r="16" fill="url(#ssGrad1)" filter="url(#ssGlow)" className="ss-logo-core" />
      <circle cx="50" cy="50" r="8" fill="#FFFFFF" opacity="0.9" />

      <style>
        {`
          .ss-logo-animated .ss-logo-ring-outer {
            animation: ssSpin 12s linear infinite;
            transform-origin: center;
          }
          .ss-logo-animated .ss-logo-ring-inner {
            animation: ssSpinReverse 8s linear infinite;
            transform-origin: center;
          }
          .ss-logo-animated .ss-logo-core {
            animation: ssPulse 2s ease-in-out infinite alternate;
            transform-origin: center;
          }
          @keyframes ssSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes ssSpinReverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes ssPulse {
            0% { transform: scale(0.92); opacity: 0.85; }
            100% { transform: scale(1.08); opacity: 1; }
          }
        `}
      </style>
    </svg>
  );
}
