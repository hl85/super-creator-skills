import { waitForChromeDebugPort, CdpConnection } from "sc-chrome-cdp";

const wsUrl = await waitForChromeDebugPort(9222, 15_000);
console.log("CDP connected");
const cdp = await CdpConnection.connect(wsUrl, 10_000, { defaultTimeoutMs: 10_000 });

const { targetInfos } = await cdp.send("Target.getTargets");
const xhsTarget = targetInfos.find(t => t.type === "page" && t.url.includes("xiaohongshu"));

if (!xhsTarget) {
  console.log("No XHS tab. Tabs:", targetInfos.filter(t=>t.type==="page").map(t=>t.url));
  cdp.close();
  process.exit(0);
}

console.log("XHS tab:", xhsTarget.url);
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId: xhsTarget.targetId, flatten: true });
await cdp.send("Runtime.enable", {}, { sessionId });
await cdp.send("Page.enable", {}, { sessionId });

// Navigate to publish page
console.log("Navigating to publish page...");
await cdp.send("Page.navigate", { url: "https://creator.xiaohongshu.com/publish/publish" }, { sessionId });
await new Promise(r => setTimeout(r, 10000));

const result = await cdp.send("Runtime.evaluate", {
  expression: `JSON.stringify({
    url: location.href,
    title: document.title,
    bodyText: document.body?.innerText?.slice(0, 300),
    allInputs: Array.from(document.querySelectorAll("input")).map(el => ({type:el.type, cls:el.className, ph:el.placeholder, accept:el.accept, id:el.id, style:el.style.display})),
    allTextareas: Array.from(document.querySelectorAll("textarea")).map(el => ({cls:el.className, ph:el.placeholder, id:el.id})),
    allEditables: Array.from(document.querySelectorAll("[contenteditable]")).map(el => ({cls:el.className, ph:el.getAttribute("data-placeholder")||"", tag:el.tagName})),
    allClickables: Array.from(document.querySelectorAll("button, a, [role=button], [class*=btn]")).slice(0,20).map(el => ({tag:el.tagName, cls:el.className, text:el.textContent?.trim().slice(0,30), href:el.getAttribute("href")})).filter(el=>el.text||el.href),
    iframes: Array.from(document.querySelectorAll("iframe")).map(el => ({src:el.src, cls:el.className, id:el.id, name:el.name})),
  }, null, 2)`,
  returnByValue: true,
}, { sessionId });

console.log(result.result.value);
cdp.close();
