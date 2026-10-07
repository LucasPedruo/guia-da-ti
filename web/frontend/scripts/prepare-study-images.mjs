import { spawn } from "node:child_process";
import {
  mkdtemp,
  readFile,
  writeFile,
  readdir,
  unlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const folder = resolve(import.meta.dirname, "../src/assets/study");
const manifest = JSON.parse(
  await readFile(join(folder, "sources.json"), "utf8"),
);
const profile = await mkdtemp(join(tmpdir(), "guia-images-"));
const chrome = spawn(
  process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { windowsHide: true, stdio: "ignore" },
);
let socket;
try {
  let port;
  for (let i = 0; i < 100; i++) {
    try {
      port = (
        await readFile(join(profile, "DevToolsActivePort"), "utf8")
      ).split("\n")[0];
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  if (!port) throw Error("Chrome unavailable");
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  socket = new WebSocket(
    targets.find((t) => t.type === "page").webSocketDebuggerUrl,
  );
  await new Promise((r, j) => {
    socket.onopen = r;
    socket.onerror = j;
  });
  let id = 0;
  const pending = new Map();
  socket.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      m.error ? p.reject(m.error) : p.resolve(m.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, { resolve, reject });
      socket.send(JSON.stringify({ id: n, method, params }));
    });
  await send("Page.enable");
  const tiles = [];
  for (const item of manifest) {
    if (!item.file) throw Error(`Missing image: ${item.key}`);
    const ext = item.file.split(".").at(-1);
    const mime = {
      svg: "image/svg+xml",
      png: "image/png",
      jpg: "image/jpeg",
      webp: "image/webp",
      ico: "image/x-icon",
      gif: "image/gif",
      avif: "image/avif",
    }[ext];
    const bytes = await readFile(join(folder, item.file));
    const data = `data:${mime};base64,${bytes.toString("base64")}`;
    const result = await send("Runtime.evaluate", {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async()=>{const im=new Image();im.src=${JSON.stringify(data)};await im.decode();const c=document.createElement('canvas');const scale=Math.min(1,640/im.naturalWidth,480/im.naturalHeight);c.width=Math.max(1,Math.round(im.naturalWidth*scale));c.height=Math.max(1,Math.round(im.naturalHeight*scale));const ctx=c.getContext('2d');ctx.drawImage(im,0,0,c.width,c.height);const pixels=ctx.getImageData(0,0,c.width,c.height).data;let brightness=0,visible=0,transparent=0;for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<128)transparent++;else{brightness+=(pixels[i]+pixels[i+1]+pixels[i+2])/3;visible++;}}return{width:im.naturalWidth,height:im.naturalHeight,background:transparent>pixels.length/16&&brightness/visible>190?'#111827':'#f8fafc',encoded:c.toDataURL('image/webp',0.88)};})()`,
    });
    if (result.exceptionDetails) throw Error(`${item.key}: invalid image`);
    const { encoded, ...dimensions } = result.result.value;
    Object.assign(item, dimensions);
    if (ext !== "svg" && ext !== "webp") {
      item.file = `${item.key}.webp`;
      const optimized = Buffer.from(encoded.split(",")[1], "base64");
      await writeFile(join(folder, item.file), optimized);
      item.bytes = optimized.length;
    }
    for (const filename of await readdir(
      join(folder, item.key.split("/")[0]),
    )) {
      if (
        filename.replace(/\.[^.]+$/, "") === item.key.split("/")[1] &&
        `${item.key.split("/")[0]}/${filename}` !== item.file
      )
        await unlink(join(folder, item.key.split("/")[0], filename));
    }
    const tileData = ext === "svg" || ext === "webp" ? data : encoded;
    tiles.push(
      `<article><div style="background:${item.background}"><img src="${tileData}"></div><p>${item.key}</p></article>`,
    );
  }
  await writeFile(
    join(folder, "sources.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1440,
    deviceScaleFactor: 1,
    mobile: false,
  });
  const tree = await send("Page.getFrameTree");
  await send("Page.setDocumentContent", {
    frameId: tree.frameTree.frame.id,
    html: `<html><style>body{margin:16px;background:#e2e8f0;font:11px Arial}main{display:grid;grid-template-columns:repeat(8,1fr);gap:8px}article{background:white;padding:8px;border-radius:6px}article div{height:126px;display:grid;place-items:center}img{max-width:100%;max-height:110px}p{height:28px;word-break:break-word}</style><main>${tiles.join("")}</main></html>`,
  });
  await send("Runtime.evaluate", {
    awaitPromise: true,
    expression: "Promise.all([...document.images].map(im=>im.decode()))",
  });
  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });
  const screenshotPath = join(tmpdir(), "guia-study-images.png");
  await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
  console.log(
    JSON.stringify({
      images: manifest.length,
      bytes: manifest.reduce((n, i) => n + i.bytes, 0),
      small: manifest
        .filter((i) => i.width < 48 || i.height < 20)
        .map((i) => ({ key: i.key, width: i.width, height: i.height })),
      screenshotPath,
    }),
  );
} finally {
  socket?.close();
  chrome.kill();
}
