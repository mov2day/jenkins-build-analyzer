import { useState, useMemo, useCallback, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

/* ── Google Fonts ── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
document.head.appendChild(fontLink);

/* ── Design tokens ── */
const T = {
  bg: "#080c14", surface: "#0e1520", card: "#111b2b", cardHover: "#152035",
  border: "#1c2d45", borderFaint: "#162030",
  accent: "#3b7dff", accentDim: "#1a3a70",
  pass: "#22c55e", passDim: "#14532d",
  fail: "#f43f5e", failDim: "#4c0519",
  skip: "#94a3b8", skipDim: "#1e293b",
  warn: "#f59e0b", warnDim: "#451a03",
  purple: "#a78bfa",
  text: "#e2eaf6", textSub: "#7d92ae", textFaint: "#3d5270",
  font: "'DM Sans', sans-serif", mono: "'JetBrains Mono', monospace",
};

/* ── Sample data ── */
const SAMPLE_BUILDS = [
  { label: "Build #42", data: { duration: 87.3, failCount: 3, passCount: 47, skipCount: 2, suites: [
    { name: "com.acme.auth.LoginTest", duration: 12.1, cases: [
      { className: "com.acme.auth.LoginTest", testName: "testValidLogin", status: "PASSED", duration: 1.2 },
      { className: "com.acme.auth.LoginTest", testName: "testInvalidPassword", status: "PASSED", duration: 0.9 },
      { className: "com.acme.auth.LoginTest", testName: "testSessionTimeout", status: "FAILED", duration: 2.1,
        errorDetails: "Expected session expiry after 30s but got 60s", errorStackTrace: "AssertionError at LoginTest.java:88\n  at org.junit.Assert.assertEquals(Assert.java:115)" },
      { className: "com.acme.auth.LoginTest", testName: "testMFAFlow", status: "SKIPPED", duration: 0 },
    ]},
    { name: "com.acme.payment.CheckoutTest", duration: 25.4, cases: [
      { className: "com.acme.payment.CheckoutTest", testName: "testSuccessfulPayment", status: "PASSED", duration: 3.8 },
      { className: "com.acme.payment.CheckoutTest", testName: "testDeclinedCard", status: "PASSED", duration: 2.1 },
      { className: "com.acme.payment.CheckoutTest", testName: "testRefundFlow", status: "FAILED", duration: 5.2,
        errorDetails: "HTTP 500 from payment gateway mock — timeout after 5000ms", errorStackTrace: "at CheckoutTest.java:201\n  at PaymentGateway.process(PaymentGateway.java:88)" },
      { className: "com.acme.payment.CheckoutTest", testName: "testCurrencyConversion", status: "PASSED", duration: 1.9 },
      { className: "com.acme.payment.CheckoutTest", testName: "testCouponApply", status: "PASSED", duration: 1.4 },
    ]},
    { name: "com.acme.search.SearchTest", duration: 18.2, cases: [
      { className: "com.acme.search.SearchTest", testName: "testBasicSearch", status: "PASSED", duration: 0.8 },
      { className: "com.acme.search.SearchTest", testName: "testFilterByCategory", status: "PASSED", duration: 1.1 },
      { className: "com.acme.search.SearchTest", testName: "testSortByPrice", status: "FAILED", duration: 2.4,
        errorDetails: "Expected ascending order but results were unordered", errorStackTrace: "at SearchTest.java:156" },
      { className: "com.acme.search.SearchTest", testName: "testFuzzySearch", status: "PASSED", duration: 1.5 },
      { className: "com.acme.search.SearchTest", testName: "testEmptyResults", status: "PASSED", duration: 0.6 },
      { className: "com.acme.search.SearchTest", testName: "testPagination", status: "PASSED", duration: 0.9 },
    ]},
    { name: "com.acme.cart.CartTest", duration: 14.3, cases: [
      { className: "com.acme.cart.CartTest", testName: "testAddItem", status: "PASSED", duration: 0.7 },
      { className: "com.acme.cart.CartTest", testName: "testRemoveItem", status: "PASSED", duration: 0.6 },
      { className: "com.acme.cart.CartTest", testName: "testUpdateQuantity", status: "PASSED", duration: 0.8 },
      { className: "com.acme.cart.CartTest", testName: "testCartPersistence", status: "PASSED", duration: 1.1 },
      { className: "com.acme.cart.CartTest", testName: "testGuestCart", status: "SKIPPED", duration: 0 },
    ]},
  ]}},
  { label: "Build #43", data: { duration: 91.7, failCount: 5, passCount: 44, skipCount: 3, suites: [
    { name: "com.acme.auth.LoginTest", duration: 13.4, cases: [
      { className: "com.acme.auth.LoginTest", testName: "testValidLogin", status: "PASSED", duration: 1.3 },
      { className: "com.acme.auth.LoginTest", testName: "testInvalidPassword", status: "FAILED", duration: 1.8,
        errorDetails: "Unexpected redirect to /error instead of showing inline message", errorStackTrace: "at LoginTest.java:45\n  at WebDriver.get(RemoteWebDriver.java:325)" },
      { className: "com.acme.auth.LoginTest", testName: "testSessionTimeout", status: "FAILED", duration: 2.3,
        errorDetails: "Expected session expiry after 30s but got 60s", errorStackTrace: "at LoginTest.java:88" },
      { className: "com.acme.auth.LoginTest", testName: "testMFAFlow", status: "SKIPPED", duration: 0 },
    ]},
    { name: "com.acme.payment.CheckoutTest", duration: 27.1, cases: [
      { className: "com.acme.payment.CheckoutTest", testName: "testSuccessfulPayment", status: "PASSED", duration: 3.9 },
      { className: "com.acme.payment.CheckoutTest", testName: "testDeclinedCard", status: "PASSED", duration: 2.2 },
      { className: "com.acme.payment.CheckoutTest", testName: "testRefundFlow", status: "FAILED", duration: 5.8,
        errorDetails: "HTTP 500 from payment gateway mock", errorStackTrace: "at CheckoutTest.java:201" },
      { className: "com.acme.payment.CheckoutTest", testName: "testCurrencyConversion", status: "PASSED", duration: 1.8 },
      { className: "com.acme.payment.CheckoutTest", testName: "testCouponApply", status: "FAILED", duration: 2.1,
        errorDetails: "Coupon SAVE10 returned 0% discount instead of 10%", errorStackTrace: "at CheckoutTest.java:267" },
    ]},
    { name: "com.acme.search.SearchTest", duration: 19.5, cases: [
      { className: "com.acme.search.SearchTest", testName: "testBasicSearch", status: "PASSED", duration: 0.9 },
      { className: "com.acme.search.SearchTest", testName: "testFilterByCategory", status: "PASSED", duration: 1.2 },
      { className: "com.acme.search.SearchTest", testName: "testSortByPrice", status: "FAILED", duration: 2.6,
        errorDetails: "Expected ascending order but results were unordered", errorStackTrace: "at SearchTest.java:156" },
      { className: "com.acme.search.SearchTest", testName: "testFuzzySearch", status: "PASSED", duration: 1.6 },
      { className: "com.acme.search.SearchTest", testName: "testEmptyResults", status: "PASSED", duration: 0.7 },
      { className: "com.acme.search.SearchTest", testName: "testPagination", status: "PASSED", duration: 0.9 },
    ]},
    { name: "com.acme.cart.CartTest", duration: 15.1, cases: [
      { className: "com.acme.cart.CartTest", testName: "testAddItem", status: "PASSED", duration: 0.8 },
      { className: "com.acme.cart.CartTest", testName: "testRemoveItem", status: "PASSED", duration: 0.7 },
      { className: "com.acme.cart.CartTest", testName: "testUpdateQuantity", status: "PASSED", duration: 0.9 },
      { className: "com.acme.cart.CartTest", testName: "testCartPersistence", status: "PASSED", duration: 1.2 },
      { className: "com.acme.cart.CartTest", testName: "testGuestCart", status: "SKIPPED", duration: 0 },
    ]},
  ]}},
  { label: "Build #44", data: { duration: 79.2, failCount: 2, passCount: 49, skipCount: 1, suites: [
    { name: "com.acme.auth.LoginTest", duration: 10.9, cases: [
      { className: "com.acme.auth.LoginTest", testName: "testValidLogin", status: "PASSED", duration: 1.1 },
      { className: "com.acme.auth.LoginTest", testName: "testInvalidPassword", status: "PASSED", duration: 0.8 },
      { className: "com.acme.auth.LoginTest", testName: "testSessionTimeout", status: "PASSED", duration: 1.9 },
      { className: "com.acme.auth.LoginTest", testName: "testMFAFlow", status: "PASSED", duration: 3.1 },
    ]},
    { name: "com.acme.payment.CheckoutTest", duration: 22.3, cases: [
      { className: "com.acme.payment.CheckoutTest", testName: "testSuccessfulPayment", status: "PASSED", duration: 3.6 },
      { className: "com.acme.payment.CheckoutTest", testName: "testDeclinedCard", status: "PASSED", duration: 2.0 },
      { className: "com.acme.payment.CheckoutTest", testName: "testRefundFlow", status: "PASSED", duration: 4.1 },
      { className: "com.acme.payment.CheckoutTest", testName: "testCurrencyConversion", status: "PASSED", duration: 1.7 },
      { className: "com.acme.payment.CheckoutTest", testName: "testCouponApply", status: "PASSED", duration: 1.3 },
    ]},
    { name: "com.acme.search.SearchTest", duration: 17.4, cases: [
      { className: "com.acme.search.SearchTest", testName: "testBasicSearch", status: "PASSED", duration: 0.7 },
      { className: "com.acme.search.SearchTest", testName: "testFilterByCategory", status: "PASSED", duration: 1.0 },
      { className: "com.acme.search.SearchTest", testName: "testSortByPrice", status: "FAILED", duration: 2.3,
        errorDetails: "Expected ascending order but results were unordered", errorStackTrace: "at SearchTest.java:156" },
      { className: "com.acme.search.SearchTest", testName: "testFuzzySearch", status: "PASSED", duration: 1.4 },
      { className: "com.acme.search.SearchTest", testName: "testEmptyResults", status: "PASSED", duration: 0.5 },
      { className: "com.acme.search.SearchTest", testName: "testPagination", status: "PASSED", duration: 0.8 },
    ]},
    { name: "com.acme.cart.CartTest", duration: 13.8, cases: [
      { className: "com.acme.cart.CartTest", testName: "testAddItem", status: "PASSED", duration: 0.7 },
      { className: "com.acme.cart.CartTest", testName: "testRemoveItem", status: "PASSED", duration: 0.6 },
      { className: "com.acme.cart.CartTest", testName: "testUpdateQuantity", status: "PASSED", duration: 0.8 },
      { className: "com.acme.cart.CartTest", testName: "testCartPersistence", status: "FAILED", duration: 2.9,
        errorDetails: "Cart state lost on page refresh — localStorage read returned null", errorStackTrace: "at CartTest.java:112" },
      { className: "com.acme.cart.CartTest", testName: "testGuestCart", status: "SKIPPED", duration: 0 },
    ]},
  ]}},
];

const fmtDur = s => s >= 60 ? `${(s / 60).toFixed(1)}m` : `${s.toFixed(2)}s`;
const fmtPct = (n, d) => d === 0 ? "—" : `${((n / d) * 100).toFixed(1)}%`;
const shortClass = cls => cls.split(".").pop();
const shortSuite = name => name.split(".").slice(-2).join(".");

function parseBuild(b) {
  const cases = [];
  (b.data.suites || []).forEach(s => (s.cases || []).forEach(c => cases.push({ ...c, suite: s.name })));
  const total = (b.data.failCount || 0) + (b.data.passCount || 0) + (b.data.skipCount || 0);
  return { label: b.label, duration: b.data.duration || 0,
    failCount: b.data.failCount || 0, passCount: b.data.passCount || 0,
    skipCount: b.data.skipCount || 0, total, cases, suites: b.data.suites || [] };
}

function analyzeBuilds(builds) {
  if (!builds.length) return null;
  const parsed = builds.map(parseBuild);
  const testMap = {};
  parsed.forEach((b, bi) => {
    b.cases.forEach(c => {
      const key = `${c.className}::${c.testName}`;
      if (!testMap[key]) testMap[key] = { className: c.className, testName: c.testName, suite: c.suite, builds: [] };
      testMap[key].builds.push({ buildIdx: bi, label: b.label, status: c.status,
        duration: c.duration || 0, errorDetails: c.errorDetails, errorStackTrace: c.errorStackTrace });
    });
  });
  const tests = Object.values(testMap).map(t => {
    const statuses = t.builds.map(b => b.status);
    const failCnt = statuses.filter(s => s === "FAILED").length;
    const passCnt = statuses.filter(s => s === "PASSED").length;
    const latest = t.builds[t.builds.length - 1]?.status;
    const prev = t.builds[t.builds.length - 2]?.status;
    t.failRate = failCnt / statuses.length;
    t.latestStatus = latest;
    t.avgDuration = t.builds.reduce((a, b) => a + b.duration, 0) / t.builds.length;
    t.classification = failCnt === statuses.length ? "ALWAYS_FAILING"
      : passCnt === statuses.length ? "STABLE"
      : failCnt > 0 && passCnt > 0 ? "FLAKY" : "SKIPPED";
    t.isNewFailure = latest === "FAILED" && prev === "PASSED";
    t.isFixed = latest === "PASSED" && prev === "FAILED";
    return t;
  });
  const suiteMap = {};
  parsed.forEach(b => {
    b.suites.forEach(s => {
      if (!suiteMap[s.name]) suiteMap[s.name] = { name: s.name, pass: 0, fail: 0, skip: 0, totalDuration: 0, buildCount: 0 };
      suiteMap[s.name].totalDuration += s.duration || 0;
      suiteMap[s.name].buildCount++;
      (s.cases || []).forEach(c => {
        if (c.status === "PASSED") suiteMap[s.name].pass++;
        else if (c.status === "FAILED") suiteMap[s.name].fail++;
        else suiteMap[s.name].skip++;
      });
    });
  });
  return { parsed, tests, suiteMap: Object.values(suiteMap) };
}

const STATUS_CFG = {
  PASSED:         { bg: "#0a2e1a", border: "#166534", color: "#22c55e", label: "Passed" },
  FAILED:         { bg: "#2a0a12", border: "#9f1239", color: "#f43f5e", label: "Failed" },
  SKIPPED:        { bg: "#141c26", border: "#334155", color: "#94a3b8", label: "Skipped" },
  FLAKY:          { bg: "#2a1900", border: "#92400e", color: "#f59e0b", label: "Flaky" },
  ALWAYS_FAILING: { bg: "#2a0a12", border: "#9f1239", color: "#f43f5e", label: "Broken" },
  NEW_FAILURE:    { bg: "#2a1400", border: "#9a3412", color: "#fb923c", label: "Regression" },
  FIXED:          { bg: "#0a2e1a", border: "#166534", color: "#4ade80", label: "Fixed" },
  STABLE:         { bg: "#0a2e1a", border: "#166534", color: "#22c55e", label: "Stable" },
};
const Pill = ({ status, sm }) => {
  const c = STATUS_CFG[status] || STATUS_CFG.SKIPPED;
  return (
    <span style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      fontSize: sm ? 10 : 11, fontWeight: 600, padding: sm ? "2px 7px" : "3px 10px",
      borderRadius: 5, letterSpacing: 0.2, fontFamily: T.font, whiteSpace: "nowrap" }}>
      {c.label}
    </span>
  );
};

function Counter({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!value) { setN(0); return; }
    let v = 0; const step = Math.max(1, Math.ceil(value / 18));
    const id = setInterval(() => { v = Math.min(v + step, value); setN(v); if (v >= value) clearInterval(id); }, 25);
    return () => clearInterval(id);
  }, [value]);
  return n;
}

const MetricCard = ({ label, value, sub, color, icon }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
    padding: "18px 22px", flex: 1, minWidth: 110, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
      background: `linear-gradient(90deg, ${color}, ${color}33)`, borderRadius: "10px 10px 0 0" }} />
    <div style={{ fontSize: 11, fontWeight: 600, color: T.textSub, letterSpacing: 0.5,
      textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
      {icon} {label}
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color: T.text, lineHeight: 1, fontFamily: T.mono }}>
      <Counter value={typeof value === "number" ? value : 0} />
    </div>
    {sub && <div style={{ fontSize: 12, color, fontWeight: 500, marginTop: 5 }}>{sub}</div>}
  </div>
);

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0c1525", border: `1px solid ${T.border}`, borderRadius: 8,
      padding: "10px 14px", fontSize: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
      <div style={{ color: T.textSub, fontWeight: 600, marginBottom: 8, fontSize: 11 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 18, marginBottom: 3 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ color: T.text, fontWeight: 700, fontFamily: T.mono }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const HealthBar = ({ pass, fail, skip }) => {
  const tot = pass + fail + skip || 1;
  return (
    <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", gap: 1 }}>
      <div style={{ background: T.pass, width: `${(pass/tot)*100}%` }} />
      <div style={{ background: T.fail, width: `${(fail/tot)*100}%` }} />
      <div style={{ background: T.skip, width: `${(skip/tot)*100}%` }} />
    </div>
  );
};

function ImportModal({ onAdd, onClose }) {
  const [label, setLabel] = useState("");
  const [json, setJson] = useState("");
  const [err, setErr] = useState("");
  const base = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7,
    color: T.text, padding: "10px 14px", fontSize: 13, fontFamily: T.font, outline: "none",
    width: "100%", boxSizing: "border-box" };
  const handle = () => {
    try { const data = JSON.parse(json); onAdd({ label: label.trim() || "Build #?", data }); }
    catch { setErr("Invalid JSON — paste the raw /testReport/api/json response"); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(4,8,18,0.85)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28,
        width: 540, maxWidth: "92vw", boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Add Jenkins Build</div>
            <div style={{ fontSize: 12, color: T.textSub, marginTop: 4 }}>
              Endpoint:{" "}
              <code style={{ color: T.accent, fontFamily: T.mono, fontSize: 11 }}>
                /job/&lt;name&gt;/&lt;build#&gt;/testReport/api/json
              </code>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textSub,
            cursor: "pointer", fontSize: 20, padding: 2, lineHeight: 1 }}>×</button>
        </div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSub,
          letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Build Label</label>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Build #47"
          style={{ ...base, fontFamily: T.mono, marginBottom: 14 }} />
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSub,
          letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>testReport JSON</label>
        <textarea value={json} onChange={e => setJson(e.target.value)} rows={6}
          placeholder={'{\n  "failCount": 3,\n  "passCount": 47,\n  "suites": [...]\n}'}
          style={{ ...base, resize: "vertical", fontFamily: T.mono, fontSize: 11, lineHeight: 1.6, marginBottom: 6 }} />
        {err && <div style={{ color: T.fail, fontSize: 12, marginBottom: 10 }}>{err}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={handle} style={{ flex: 1, background: T.accent, color: "#fff", border: "none",
            borderRadius: 7, padding: 11, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.font }}>
            Add Build
          </button>
          <button onClick={onClose} style={{ background: "none", color: T.textSub,
            border: `1px solid ${T.border}`, borderRadius: 7, padding: "11px 20px",
            fontWeight: 500, fontSize: 13, cursor: "pointer", fontFamily: T.font }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function TestRow({ test }) { const [open, setOpen] = useState(false); const fails = test.builds.filter(b => b.status === "FAILED"); return (<><tr onClick={() => setOpen(o => !o)} style={{ cursor: "pointer", borderBottom: `1px solid ${T.borderFaint}`, transition: "background 0.12s", background: open ? "#0f1929" : "transparent" }} onMouseEnter={e => { if (!open) e.currentTarget.style.background = "#0d1624"; }} onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}><td style={{ padding: "11px 14px", color: T.textFaint, fontSize: 12, width: 30 }}>{open ? "▾" : "▸"}</td><td style={{ padding: "11px 0 11px 0" }}><div style={{ fontSize: 13, color: T.text, fontFamily: T.mono, fontWeight: 500 }}>{test.testName}</div><div style={{ fontSize: 11, color: T.textSub, marginTop: 2 }}>{shortClass(test.className)}</div></td><td style={{ padding: "11px 16px" }}><Pill status={test.classification === "ALWAYS_FAILING" ? "ALWAYS_FAILING" : test.latestStatus} /></td><td style={{ padding: "11px 16px" }}><div style={{ display: "flex", gap: 3, alignItems: "center" }}>{test.builds.map((b, i) => (<div key={i} title={`${b.label}: ${b.status}`} style={{ width: 9, height: 9, borderRadius: 2, flexShrink: 0, background: b.status === "PASSED" ? T.pass : b.status === "FAILED" ? T.fail : "#334155" }} />))}</div></td><td style={{ padding: "11px 16px" }}><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{test.classification === "FLAKY" && <Pill status="FLAKY" sm />}{test.isNewFailure && <Pill status="NEW_FAILURE" sm />}{test.isFixed && <Pill status="FIXED" sm />}</div></td><td style={{ padding: "11px 20px", textAlign: "right", color: T.textSub, fontSize: 12, fontFamily: T.mono, whiteSpace: "nowrap" }}>{fmtDur(test.avgDuration)}</td></tr>{open && (<tr style={{ background: "#080d18", borderBottom: `1px solid ${T.border}` }}><td colSpan={6} style={{ padding: "18px 24px 20px 44px" }}><div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "5px 12px", fontSize: 12, marginBottom: 16, maxWidth: 600 }}><span style={{ color: T.textSub, fontWeight: 500 }}>Suite</span><span style={{ color: T.text, fontFamily: T.mono }}>{test.suite}</span><span style={{ color: T.textSub, fontWeight: 500 }}>Classification</span><span><Pill sm status={test.classification === "ALWAYS_FAILING" ? "ALWAYS_FAILING" : test.classification === "FLAKY" ? "FLAKY" : test.latestStatus} /></span><span style={{ color: T.textSub, fontWeight: 500 }}>Avg duration</span><span style={{ color: T.text, fontFamily: T.mono }}>{fmtDur(test.avgDuration)}</span><span style={{ color: T.textSub, fontWeight: 500 }}>Fail rate</span><span style={{ color: test.failRate > 0 ? T.fail : T.pass, fontFamily: T.mono, fontWeight: 600 }}>{Math.round(test.failRate * 100)}%</span></div>{fails.length > 0 && (<><div style={{ fontSize: 11, fontWeight: 700, color: T.textSub, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>Failure Details</div>{fails.map((b, i) => (<div key={i} style={{ marginBottom: 10, border: `1px solid #3b1424`, borderRadius: 8, overflow: "hidden" }}><div style={{ background: "#180812", padding: "8px 14px", display: "flex", justifyContent: "space-between" }}><span style={{ color: T.fail, fontSize: 11, fontWeight: 700 }}>{b.label}</span><span style={{ color: T.textSub, fontSize: 11, fontFamily: T.mono }}>{fmtDur(b.duration)}</span></div><div style={{ padding: "12px 14px", background: "#0e0512" }}>{b.errorDetails && (<div style={{ color: "#fca5a5", fontSize: 12, marginBottom: 8, lineHeight: 1.6 }}>{b.errorDetails}</div>)}{b.errorStackTrace && (<pre style={{ margin: 0, color: T.textSub, fontSize: 10, fontFamily: T.mono, lineHeight: 1.7, overflow: "auto", maxHeight: 80 }}>{b.errorStackTrace}</pre>)}</div></div>))}</>) }{fails.length === 0 && (<div style={{ color: T.pass, fontSize: 12 }}>✓ No failures across all loaded builds.</div>)}</td></tr>)}</>); }

const InsightCard = ({ title, accentColor, items, emptyMsg, renderItem }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
    <div style={{ padding: "13px 16px", borderBottom: `1px solid ${T.borderFaint}`,
      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: accentColor }}>{title}</span>
      <span style={{ background: accentColor + "1a", color: accentColor, fontSize: 10,
        fontWeight: 700, padding: "1px 8px", borderRadius: 10 }}>{items.length}</span>
    </div>
    {items.length === 0
      ? <div style={{ padding: "18px 16px", fontSize: 12, color: T.textSub }}>{emptyMsg}</div>
      : items.slice(0, 5).map((item, i) => (
        <div key={i} style={{ padding: "11px 16px",
          borderBottom: i < Math.min(items.length, 5) - 1 ? `1px solid ${T.borderFaint}` : "none" }}>
          {renderItem(item)}
        </div>
      ))
    }
  </div>
);

const TabBtn = ({ label, active, badge, onClick }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer",
    padding: "10px 18px", fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: T.font,
    color: active ? T.text : T.textSub, borderBottom: `2px solid ${active ? T.accent : "transparent"}`,
    transition: "all 0.15s" }}>
    {label}
    {badge !== undefined && (
      <span style={{ marginLeft: 7, background: active ? T.accent : T.surface, color: active ? "#fff" : T.textSub,
        fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10 }}>{badge}</span>
    )}
  </button>
);

const FBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ background: active ? T.accent : T.card,
    color: active ? "#fff" : T.textSub, border: `1px solid ${active ? T.accent : T.border}`,
    borderRadius: 6, padding: "6px 13px", fontSize: 11, fontWeight: 600, cursor: "pointer",
    fontFamily: T.font, transition: "all 0.12s" }}>{label}</button>
);

const Hr = () => <div style={{ height: 1, background: T.borderFaint, margin: "22px 0" }} />;

export default function App() {
  const [builds, setBuilds] = useState(SAMPLE_BUILDS);
  const [showImport, setShowImport] = useState(false);
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [sf, setSf] = useState("ALL");

  const addBuild = useCallback(b => { setBuilds(p => [...p, b]); setShowImport(false); }, []);
  const removeBuild = useCallback(i => setBuilds(p => p.filter((_, idx) => idx !== i)), []);

  const a = useMemo(() => analyzeBuilds(builds), [builds]);
  const totalPass = useMemo(() => a?.parsed.reduce((x, b) => x + b.passCount, 0) || 0, [a]);
  const totalFail = useMemo(() => a?.parsed.reduce((x, b) => x + b.failCount, 0) || 0, [a]);
  const totalSkip = useMemo(() => a?.parsed.reduce((x, b) => x + b.skipCount, 0) || 0, [a]);
  const totalRuns = totalPass + totalFail + totalSkip;

  const trend = useMemo(() => a?.parsed.map(b => ({ name: b.label, Pass: b.passCount, Fail: b.failCount, "Duration (s)": parseFloat(b.duration.toFixed(1)) })) || [], [a]);
  const flaky = useMemo(() => a?.tests.filter(t => t.classification === "FLAKY") || [], [a]);
  const broken = useMemo(() => a?.tests.filter(t => t.classification === "ALWAYS_FAILING") || [], [a]);
  const newFail = useMemo(() => a?.tests.filter(t => t.isNewFailure) || [], [a]);
  const fixed = useMemo(() => a?.tests.filter(t => t.isFixed) || [], [a]);
  const slowest = useMemo(() => a ? [...a.tests].sort((x, y) => y.avgDuration - x.avgDuration).slice(0, 6) : [], [a]);

  const latestBuild = a?.parsed[a.parsed.length - 1];
  const prevBuild = a?.parsed[a.parsed.length - 2];
  const failDelta = latestBuild && prevBuild ? latestBuild.failCount - prevBuild.failCount : null;

  const filteredTests = useMemo(() => {
    if (!a) return [];
    let t = a.tests;
    if (search) t = t.filter(x => `${x.className} ${x.testName}`.toLowerCase().includes(search.toLowerCase()));
    const map = { FAILED: x => x.latestStatus === "FAILED", PASSED: x => x.latestStatus === "PASSED", SKIPPED: x => x.latestStatus === "SKIPPED", FLAKY: x => x.classification === "FLAKY", BROKEN: x => x.classification === "ALWAYS_FAILING", REGRESSION: x => x.isNewFailure, FIXED: x => x.isFixed };
    if (map[sf]) t = t.filter(map[sf]);
    const rank = { FAILED: 0, SKIPPED: 1, PASSED: 2 };
    return [...t].sort((x, y) => (rank[x.latestStatus] ?? 3) - (rank[y.latestStatus] ?? 3));
  }, [a, search, sf]);

  return <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.font, color: T.text }}><div style={{padding:24}}>Jenkins Test Report Analyzer loaded with prototype UI. Use Add Build to import JSON.</div></div>;
}
