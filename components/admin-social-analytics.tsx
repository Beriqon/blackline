"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, ChevronDown, BarChart3, Clock, Eye, Camera, Link2, Music2, Sparkles } from "lucide-react";
import dashboard from "@/app/admin/dashboard/dashboard.module.css";
import styles from "./admin-social-analytics.module.css";

const channels = [
  { name: "Instagram", icon: Camera },
  { name: "TikTok", icon: Music2 },
] as const;

const videos = [
  {
    title: "Miami from the water", platform: "Instagram", format: "Destination reveal",
    cover: "/yachts/103azimut/103azimut.jpg", date: "2026-11-12", posted: "Nov 12 · 6:30 PM ET",
    hook: "This is what Miami looks like from the water.", views: 24800, length: 22, watch: 16, completion: 58, shares: 421,
    good: "The skyline appears in the first frame. This had the highest completion rate and most shares in the demo.",
    weak: "The biggest drop is at 0:17, as the montage slows and the booking prompt has yet to appear.",
    next: "Move the booking prompt to 0:12 and compare completion and tracked clicks.",
    retention: [[0, 100], [3, 90], [11, 77], [17, 62], [22, 58]],
    clicks: null, bioClicks: 86, baseline: 44,
  },
  {
    title: "What a yacht charter includes", platform: "TikTok", format: "FAQ",
    cover: "/yachts/100dominator/100dominator.jpg", date: "2026-11-10", posted: "Nov 10 · 12:15 PM ET",
    hook: "What do you actually get when you book a yacht?", views: 18300, length: 30, watch: 20, completion: 49, shares: 286,
    good: "The opening question keeps 84% of viewers through the first three seconds. The video has the longest average watch time in the demo.",
    weak: "Retention falls from 75% to 55% during the spoken list of inclusions.",
    next: "Show each inclusion on screen as it is mentioned and compare retention at 0:23.",
    retention: [[0, 100], [3, 84], [15, 75], [23, 55], [30, 49]],
    clicks: 37, bioClicks: 61, baseline: 29,
  },
  {
    title: "Behind a sunset charter", platform: "Instagram", format: "Behind the scenes",
    cover: "/yachts/97sanlorenzo/97sanlorenzo.jpg", date: "2026-11-08", posted: "Nov 8 · 5:45 PM ET",
    hook: "Come with us to set up a sunset charter.", views: 11600, length: 27, watch: 11, completion: 28, shares: 119,
    good: "The sunset reveal holds most of the remaining audience from 0:20 to the end.",
    weak: "Only 62% are still watching at 0:03. The setup opens with a slow preparation shot.",
    next: "Open on the sunset, then cut to the preparation. Compare three-second retention.",
    retention: [[0, 100], [3, 62], [13, 39], [20, 32], [27, 28]],
    clicks: null, bioClicks: 38, baseline: 44,
  },
  {
    title: "Three stops on Biscayne Bay", platform: "TikTok", format: "Itinerary",
    cover: "/yachts/96sunseeker/96sunseeker.jpg", date: "2026-11-06", posted: "Nov 6 · 7:00 PM ET",
    hook: "Three Biscayne Bay stops you can reach by yacht.", views: 8700, length: 19, watch: 12, completion: 45, shares: 163,
    good: "The numbered itinerary earned about 19 shares per 1,000 views, the highest share rate in the demo.",
    weak: "Retention drops from 78% at 0:03 to 54% at 0:09 during the transition to the second stop.",
    next: "Put all three stops on screen up front and shorten the cut between the first two.",
    retention: [[0, 100], [3, 78], [9, 54], [15, 48], [19, 45]],
    clicks: 21, bioClicks: 46, baseline: 29,
  },
  {
    title: "A half-day charter in Miami", platform: "Instagram", format: "Itinerary",
    cover: "/yachts/103azimut/103azimut4.jpg", date: "2026-09-25", posted: "Sep 25 · 6:00 PM ET",
    hook: "Here’s what we’d do with four hours on the water.", views: 13200, length: 24, watch: 15, completion: 46, shares: 211,
    good: "The four-hour itinerary earned 16 shares per 1,000 views.",
    weak: "Retention fell from 76% to 54% while the route map was on screen.",
    next: "Add a short clip of each stop while showing the route.",
    retention: [[0, 100], [3, 82], [9, 76], [16, 54], [24, 46]],
    clicks: null, bioClicks: 52, baseline: 41,
  },
  {
    title: "The first five minutes onboard", platform: "TikTok", format: "Guest experience",
    cover: "/yachts/96sunseeker/96sunseeker4.jpg", date: "2026-05-21", posted: "May 21 · 5:00 PM ET",
    hook: "Here’s what happens as soon as you step onboard.", views: 10400, length: 20, watch: 12, completion: 40, shares: 137,
    good: "The boarding sequence kept 79% of viewers through the first three seconds.",
    weak: "Retention dropped to 52% during the cabin walkthrough.",
    next: "Try two quick cabin shots before returning to the guest experience.",
    retention: [[0, 100], [3, 79], [8, 68], [14, 52], [20, 40]],
    clicks: 19, bioClicks: 42, baseline: 27,
  },
] as const;

const ideas = [
  ["Open with the payoff", "Show the skyline in the first frame of the next charter tour. Compare completion with the previous tour."],
  ["Answer a booking question", "Start with “What’s included in a Miami yacht charter?” and explain three inclusions in 25 seconds."],
  ["Test a direct call to action", "Close the itinerary video with “See available charters via our bio.” Track visits and inquiries by channel."],
];

const demoEnd = "2026-11-17";
const periods = {
  "7": { label: "Last 7 days", start: "2026-11-11" },
  "30": { label: "Last 30 days", start: "2026-10-19" },
  "90": { label: "Last 90 days", start: "2026-08-20" },
  year: { label: "This year", start: "2026-01-01" },
  custom: { label: "Custom range", start: "" },
} as const;

const traffic = [
  { date: "2026-11-15", platform: "Instagram", visits: 124, inquiries: 5 },
  { date: "2026-11-14", platform: "TikTok", visits: 62, inquiries: 2 },
  { date: "2026-11-10", platform: "Instagram", visits: 188, inquiries: 7 },
  { date: "2026-11-09", platform: "TikTok", visits: 112, inquiries: 4 },
  { date: "2026-09-26", platform: "Instagram", visits: 138, inquiries: 5 },
  { date: "2026-05-22", platform: "TikTok", visits: 95, inquiries: 3 },
] as const;

const videoPageSize = 5;
const number = new Intl.NumberFormat("en-US");

export function AdminSocialAnalytics() {
  const [videoLimit, setVideoLimit] = useState(videoPageSize);
  const [platform, setPlatform] = useState("All platforms");
  const [sort, setSort] = useState<"views" | "watch" | "completion" | "shares">("views");
  const [period, setPeriod] = useState<keyof typeof periods>("30");
  const [customStart, setCustomStart] = useState(periods["30"].start as string);
  const [customEnd, setCustomEnd] = useState(demoEnd);
  const start = period === "custom" ? customStart : periods[period].start;
  const end = period === "custom" ? customEnd : demoEnd;
  const validRange = Boolean(start && end && start <= end);
  const inRange = (date: string) => validRange && date >= start && date <= end;
  const periodVideos = videos.filter(video => inRange(video.date));
  const rankedVideos = periodVideos
    .filter(video => platform === "All platforms" || video.platform === platform)
    .sort((a, b) => b[sort] - a[sort]);

  const channelTraffic = channels.map(channel => {
    const entries = traffic.filter(entry => entry.platform === channel.name && inRange(entry.date));
    return {
      ...channel,
      visits: entries.reduce((total, entry) => total + entry.visits, 0),
      inquiries: entries.reduce((total, entry) => total + entry.inquiries, 0),
    };
  });
  const views = periodVideos.reduce((total, video) => total + video.views, 0);
  const watchTime = periodVideos.reduce((total, video) => total + video.watch * video.views, 0);
  const visits = channelTraffic.reduce((total, channel) => total + channel.visits, 0);
  const inquiries = channelTraffic.reduce((total, channel) => total + channel.inquiries, 0);

  return (
    <div className={styles.page}>
      <div className={dashboard.pageHeading}>
        <div>
          <p className={dashboard.eyebrow}>BLACKLINE / MARKETING &amp; CONTENT</p>
          <h1>Social analytics <span className={styles.badge}>Soon</span></h1>
          <p>See what holds attention and what drives visits and inquiries.</p>
        </div>
        <a className={dashboard.secondary} href="#social-accounts"><Link2 size={15} /> Manage connections</a>
      </div>

      <aside className={styles.notice}>
        <BarChart3 size={18} aria-hidden="true" />
        <div><strong>Demo preview</strong><p>All figures and AI insights below are examples. Account connections and live reporting are coming soon.</p></div>
      </aside>

      <div className={`${styles.card} ${styles.periodFilter}`}>
        <div><h2>Reporting period</h2><p>Demo data through November 17, 2026.</p></div>
        <div className={styles.filters}>
          <label>Period
            <select value={period} onChange={event => { setPeriod(event.target.value as keyof typeof periods); setVideoLimit(videoPageSize); }}>
              {Object.entries(periods).map(([value, option]) => <option key={value} value={value}>{option.label}</option>)}
            </select>
          </label>
          {period === "custom" && (
            <>
              <label>From<input type="date" value={customStart} onChange={event => { setCustomStart(event.target.value); setVideoLimit(videoPageSize); }} /></label>
              <label>To<input type="date" value={customEnd} onChange={event => { setCustomEnd(event.target.value); setVideoLimit(videoPageSize); }} /></label>
            </>
          )}
        </div>
        {!validRange && <p role="status">Choose a start date and an end date on or after it.</p>}
      </div>

      <section aria-labelledby="social-summary">
        <div className={styles.heading}><h2 id="social-summary">Performance overview</h2><span>{periods[period].label} · demo</span></div>
        <div className={styles.metrics}>
          {[
            { label: "Video views", value: number.format(views), note: `${periodVideos.length} example videos published in this period`, icon: Eye },
            { label: "Average watch time", value: views ? `${(watchTime / views).toFixed(1)} s` : "—", note: "Weighted by views", icon: Clock },
            { label: "Website visits", value: number.format(visits), note: "From tagged social links", icon: ArrowUpRight },
            { label: "Website inquiries", value: number.format(inquiries), note: visits ? `${(inquiries / visits * 100).toFixed(1)}% of social visits` : "No visits in this period", icon: Link2 },
          ].map(({ label, value, note, icon: Icon }) => (
            <article className={styles.card} key={label}>
              <div className={styles.metricLabel}>{label}<Icon size={17} aria-hidden="true" /></div>
              <strong className={styles.metricValue}>{value}</strong>
              <p>{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.card} aria-labelledby="social-videos">
        <div className={styles.heading}>
          <div><h2 id="social-videos">Video performance</h2><p>Videos published in the selected period. Expand a video to see its analysis and first-day clicks.</p></div>
          <div className={styles.filters}>
            <select aria-label="Filter by platform" value={platform} onChange={event => { setPlatform(event.target.value); setVideoLimit(videoPageSize); }}>
              <option>All platforms</option>
              {channels.map(channel => <option key={channel.name}>{channel.name}</option>)}
            </select>
            <select aria-label="Sort videos by" value={sort} onChange={event => { setSort(event.target.value as typeof sort); setVideoLimit(videoPageSize); }}>
              <option value="views">Most views</option>
              <option value="watch">Longest watch time</option>
              <option value="completion">Highest completion</option>
              <option value="shares">Most shares</option>
            </select>
          </div>
        </div>
        <div className={styles.videos}>
          {rankedVideos.length === 0 && <p className={styles.empty}>No demo videos match this period and platform.</p>}
          {rankedVideos.slice(0, videoLimit).map(video => (
            <details key={video.title}>
              <summary>
                <span className={styles.videoTitle}>
                  <span className={styles.thumbnail}>
                    <Image src={video.cover} width={160} height={90} alt="" />
                    <span>0:{video.length}</span>
                  </span>
                  <span><strong>{video.title}</strong><small>{video.platform} · {video.format}</small><small>{video.posted}</small></span>
                </span>
                <span><small>Views</small>{number.format(video.views)}</span>
                <span><small>Avg. watch / length</small>{video.watch} / {video.length} s</span>
                <span><small>Watched in full</small>{video.completion}%</span>
                <span><small>Shares</small>{video.shares}</span>
                <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />
              </summary>
              <div className={styles.videoAnalysis}>
                <p className={styles.hook}><strong>Opening line</strong> “{video.hook}”</p>
                <div className={styles.analysisGrid}>
                  <div><h3>What worked</h3><p>{video.good}</p></div>
                  <div><h3>What could improve</h3><p>{video.weak}</p></div>
                  <div><h3>What to test next</h3><p>{video.next}</p></div>
                </div>
                <div className={styles.detailGrid}>
                  <section className={styles.detailPanel}>
                    <h3>Viewer retention</h3>
                    <p>Share of viewers still watching at each point.</p>
                    <ol className={styles.retention}>
                      {video.retention.map(([seconds, percent]) => (
                        <li key={seconds}>
                          <div className={styles.retentionTrack} aria-hidden="true"><span style={{ height: `${percent}%` }} /></div>
                          <strong>{percent}%</strong>
                          <small>0:{String(seconds).padStart(2, "0")}</small>
                        </li>
                      ))}
                    </ol>
                  </section>
                  <section className={styles.detailPanel}>
                    <h3>Website clicks · first 24 hours</h3>
                    <dl className={styles.clicks}>
                      <div><dt>Clicks via this video</dt><dd>{video.clicks ?? "Unavailable"}</dd></div>
                      <div><dt>{video.platform} bio link clicks</dt><dd>{video.bioClicks}</dd></div>
                      <div><dt>Typical 24-hour bio clicks</dt><dd>{video.baseline}</dd></div>
                    </dl>
                    <p>{video.clicks === null ? "A dedicated tracking link is required to attribute clicks to this video." : "Video clicks are measured via its dedicated campaign link."} Bio clicks count all clicks on the platform’s bio link in the 24 hours after posting.</p>
                  </section>
                </div>
              </div>
            </details>
          ))}
        </div>
        <div className={styles.videoFooter}>
          <p role="status">Showing {Math.min(videoLimit, rankedVideos.length)} of {rankedVideos.length} videos</p>
          {rankedVideos.length > videoLimit && (
            <button type="button" className={dashboard.secondary} onClick={() => setVideoLimit(limit => limit + videoPageSize)}>
              Show {Math.min(videoPageSize, rankedVideos.length - videoLimit)} more
            </button>
          )}
        </div>
        <p>Watch time and completion are illustrative. Live metrics will depend on platform access.</p>
      </section>

      <div className={styles.columns}>
        <section className={styles.card} aria-labelledby="social-traffic">
          <div className={styles.heading}><h2 id="social-traffic">Website traffic</h2><span>Tagged bio links</span></div>
          <div className={styles.traffic}>
            {channelTraffic.map(({ name, visits: channelVisits, inquiries: channelInquiries, icon: Icon }) => (
              <div key={name}>
                <div className={styles.trafficLabel}><strong><Icon size={17} aria-hidden="true" />{name}</strong><span>{channelVisits} visits · {channelInquiries} inquiries</span></div>
                <div className={styles.track} aria-hidden="true"><div style={{ width: `${visits ? channelVisits / visits * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
          <p>Visits from a shared bio link are attributed to the platform. A unique campaign link can identify a specific post.</p>
        </section>

        <section className={styles.card} aria-labelledby="social-briefing">
          <div className={styles.heading}><h2 id="social-briefing"><Sparkles size={18} aria-hidden="true" /> Weekly content briefing</h2><span className={styles.badge}>Soon</span></div>
          <ol className={styles.ideas}>
            {ideas.map(([title, description]) => <li key={title}><strong>{title}</strong><p>{description}</p></li>)}
          </ol>
        </section>
      </div>

      <section id="social-accounts" aria-labelledby="social-accounts-title">
        <div className={styles.heading}><div><h2 id="social-accounts-title">Connected accounts</h2><p>Connect the accounts you want to include in this workspace.</p></div></div>
        <div className={styles.columns}>
          {channels.map(({ name, icon: Icon }) => (
            <article className={`${styles.card} ${styles.account}`} key={name}>
              <Icon size={22} aria-hidden="true" />
              <div><h3>{name}</h3><p>Not connected</p></div>
              <button type="button" className={dashboard.secondary} disabled>Connect {name} · Soon</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
