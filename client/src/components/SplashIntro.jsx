import { useEffect, useState } from "react";
import Logo from "./Logo";

const QUOTES = [
  "“Empowering Minds, Shaping Futures — Welcome to Enterprise Learning.”",
  "“The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.”",
  "“Invest in your mind. Master modern software engineering with Enterprise Learning.”",
];

export default function SplashIntro({ onComplete }) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Pick random quote
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length));

    // Progress bar fills over ~4.2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 42);

    // Auto complete after 4.8 seconds total
    const timer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 700);
    }, 4800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 400);
  };

  return (
    <div className={`ss-splash-screen ${fadingOut ? "is-fading-out" : ""}`}>
      <div className="ss-splash-bg-glow" />

      <div className="ss-splash-content">
        <div className="ss-splash-logo-wrap">
          <Logo width={130} height={130} animated={true} />
        </div>

        <h1 className="ss-splash-brand">
          Enterprise <span>Learning</span>
        </h1>
        <p className="ss-splash-tagline">SKILL AND CAREER GUIDANCE SYSTEM</p>

        <div className="ss-splash-quote-box">
          <p className="ss-splash-quote">{QUOTES[quoteIndex]}</p>
        </div>

        <div className="ss-splash-bar-wrap">
          <div className="ss-splash-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <button className="ss-splash-skip-btn" onClick={handleSkip}>
          Enter Platform &rarr;
        </button>
      </div>

      <style>
        {`
          .ss-splash-screen {
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: #06081E;
            color: #F3F4F6;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
            overflow: hidden;
            transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .ss-splash-screen.is-fading-out {
            opacity: 0;
            transform: scale(1.05);
            pointer-events: none;
          }
          .ss-splash-bg-glow {
            position: absolute;
            width: 650px;
            height: 650px;
            background: radial-gradient(circle, rgba(124,108,246,0.28) 0%, rgba(34,211,238,0.18) 40%, transparent 70%);
            border-radius: 50%;
            filter: blur(70px);
            animation: ssPulseBg 5s ease-in-out infinite alternate;
          }
          .ss-splash-content {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            max-width: 640px;
            padding: 30px;
            animation: ssSlideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .ss-splash-logo-wrap {
            margin-bottom: 24px;
            filter: drop-shadow(0 0 35px rgba(124,108,246,0.65));
          }
          .ss-splash-brand {
            font-size: 40px;
            font-weight: 800;
            letter-spacing: -0.02em;
            margin: 0 0 6px;
            background: linear-gradient(135deg, #FFFFFF, #CBD5E1);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .ss-splash-brand span {
            background: linear-gradient(135deg, #7C6CF6, #22D3EE);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .ss-splash-tagline {
            font-size: 11.5px;
            letter-spacing: 0.24em;
            text-transform: uppercase;
            color: #22D3EE;
            font-weight: 700;
            margin-bottom: 24px;
          }
          .ss-splash-quote-box {
            background: rgba(255, 255, 255, 0.035);
            border: 1px solid rgba(255, 255, 255, 0.09);
            border-radius: 18px;
            padding: 18px 28px;
            margin-bottom: 28px;
            backdrop-filter: blur(12px);
          }
          .ss-splash-quote {
            font-size: 15.5px;
            font-style: italic;
            color: #CBD5E1;
            margin: 0;
            line-height: 1.6;
          }
          .ss-splash-bar-wrap {
            width: 280px;
            height: 4px;
            background: rgba(255,255,255,0.08);
            border-radius: 999px;
            overflow: hidden;
            margin-bottom: 22px;
          }
          .ss-splash-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #7C6CF6, #22D3EE);
            border-radius: 999px;
            transition: width 0.04s linear;
          }
          .ss-splash-skip-btn {
            background: transparent;
            border: none;
            color: #94A3B8;
            font-size: 13px;
            cursor: pointer;
            transition: color 0.2s ease;
          }
          .ss-splash-skip-btn:hover {
            color: #22D3EE;
          }
          @keyframes ssSlideUp {
            0% { opacity: 0; transform: translateY(24px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes ssPulseBg {
            0% { transform: scale(0.9); opacity: 0.6; }
            100% { transform: scale(1.1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
