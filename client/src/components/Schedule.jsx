import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "./AppLayout";
import api from "../api/client";
import "./Dashboard.css";

const TYPE_COLORS = {
  LIVE_SESSION: "#7C6CF6",
  ASSIGNMENT_DUE: "#F97316",
  STUDY_PLAN: "#22D3EE",
};

export default function Schedule() {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIso, setSelectedIso] = useState(() => new Date().toISOString().split("T")[0]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const list = await api.get("/schedule");
      const mapped = (list || []).map((ev) => ({
        id: ev.id,
        dateStr: ev.datetime ? ev.datetime.split("T")[0] : new Date().toISOString().split("T")[0],
        time: ev.datetime ? new Date(ev.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "All Day",
        title: ev.title,
        course: ev.courseTitle,
        type: ev.type,
        link: ev.link,
      }));
      setEvents(mapped);
    } catch (err) {
      console.error("Failed to load schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const distanceToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMon + currentWeekOffset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const iso = d.toISOString().split("T")[0];
      const isToday = iso === today.toISOString().split("T")[0];
      const hasEvent = events.some((e) => e.dateStr === iso);

      days.push({
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        dateNum: d.getDate(),
        fullDate: d,
        iso,
        isToday,
        hasEvent,
      });
    }
    return days;
  }, [currentWeekOffset, events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => e.dateStr === selectedIso);
  }, [events, selectedIso]);

  const monthYearLabel = useMemo(() => {
    if (weekDays.length === 0) return "";
    const first = weekDays[0].fullDate;
    return first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [weekDays]);

  return (
    <AppLayout>
      <div className="ss-dashboard">
        <div className="ss-header" style={{ marginBottom: "1rem" }}>
          <div>
            <h1 className="ss-welcome">Interactive Study Schedule</h1>
            <p className="ss-streak">Derived from live interactive sessions, assignment deadlines, and your enrolled course milestones.</p>
          </div>
        </div>

        {/* Date Navigation & Calendar Strip */}
        <section className="ss-section">
          <div className="ss-cal-nav">
            <button className="ss-cal-btn" onClick={() => setCurrentWeekOffset((prev) => prev - 1)}>
              &larr; Previous Week
            </button>
            <h2 className="ss-cal-month">{monthYearLabel}</h2>
            <button className="ss-cal-btn" onClick={() => setCurrentWeekOffset((prev) => prev + 1)}>
              Next Week &rarr;
            </button>
          </div>

          <div className="ss-week-strip">
            {weekDays.map((w) => {
              const isSelected = w.iso === selectedIso;
              return (
                <button
                  key={w.iso}
                  className={`ss-week-day ${w.isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""}`}
                  onClick={() => setSelectedIso(w.iso)}
                >
                  <span className="ss-week-day-name">{w.name}</span>
                  <span className="ss-week-day-num">{w.dateNum}</span>
                  {w.hasEvent && <span className="ss-week-dot" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Agenda for Selected Date */}
        <section className="ss-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 className="ss-section-title" style={{ margin: 0 }}>
              Agenda for {selectedIso === new Date().toISOString().split("T")[0] ? "Today" : selectedIso}
            </h2>
            <button
              className="ss-instr-cancel"
              style={{ padding: "4px 12px", fontSize: 11 }}
              onClick={() => {
                setCurrentWeekOffset(0);
                setSelectedIso(new Date().toISOString().split("T")[0]);
              }}
            >
              Jump to Today
            </button>
          </div>

          <div className="ss-agenda">
            {loading ? (
              <p style={{ color: "var(--st-text-muted)" }}>Loading schedule events...</p>
            ) : filteredEvents.length === 0 ? (
              <div className="ss-continue-card" style={{ textAlign: "center", padding: "30px 20px" }}>
                <p style={{ color: "var(--st-text-muted)", fontSize: "14px", margin: 0 }}>
                  No sessions or deadlines scheduled for {selectedIso}.
                </p>
              </div>
            ) : (
              filteredEvents.map((e) => (
                <div className="ss-agenda-row" key={e.id}>
                  <div className="ss-agenda-time">
                    <span className="ss-agenda-clock">{e.time}</span>
                  </div>
                  <div className="ss-agenda-bar" style={{ background: TYPE_COLORS[e.type] || "#7C6CF6" }} />
                  <div className="ss-agenda-body">
                    <span className="ss-agenda-type" style={{ color: TYPE_COLORS[e.type] || "#7C6CF6" }}>{e.type}</span>
                    <h4 className="ss-continue-title">{e.title}</h4>
                    <p className="ss-agenda-course">{e.course}</p>
                    {e.link && (
                      <a href={e.link} target="_blank" rel="noreferrer" style={{ fontSize: "0.78rem", color: "#3b82f6" }}>
                        Join Link &rarr;
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <style>{`
        .ss-cal-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .ss-cal-month { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--st-cream); margin: 0; }
        .ss-cal-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--st-border); color: var(--st-cream); border-radius: 999px; padding: 6px 14px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; }
        .ss-cal-btn:hover { border-color: rgba(124,108,246,0.5); background: rgba(124,108,246,0.12); }
        .ss-week-strip { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
        .ss-week-day { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 6px; background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 14px; position: relative; cursor: pointer; transition: all 0.2s ease; }
        .ss-week-day:hover { border-color: rgba(124,108,246,0.4); transform: translateY(-2px); }
        .ss-week-day.is-today { border-color: rgba(124, 108, 246, 0.55); background: rgba(124, 108, 246, 0.12); }
        .ss-week-day.is-selected { border-color: var(--st-sage); box-shadow: 0 0 14px rgba(34,211,238,0.25); background: rgba(34,211,238,0.08); }
        .ss-week-day-name { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--st-text-muted); }
        .ss-week-day-num { font-family: var(--font-display); font-weight: 700; font-size: 17px; color: var(--st-cream); }
        .ss-week-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--st-sage); }
        .ss-agenda { display: flex; flex-direction: column; gap: 10px; }
        .ss-agenda-row { display: grid; grid-template-columns: 84px 3px 1fr; gap: 14px; align-items: stretch; background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 14px; padding: 14px 16px; backdrop-filter: blur(20px) saturate(140%); box-shadow: 0 8px 30px rgba(6, 8, 30, 0.4); }
        .ss-agenda-time { display: flex; flex-direction: column; font-size: 12px; color: var(--st-text-muted); }
        .ss-agenda-clock { font-family: var(--font-mono); color: var(--st-cream); margin-top: 2px; }
        .ss-agenda-bar { border-radius: 4px; }
        .ss-agenda-type { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .ss-agenda-course { font-size: 12px; color: var(--st-text-muted); margin-top: 2px; }
      `}</style>
    </AppLayout>
  );
}
