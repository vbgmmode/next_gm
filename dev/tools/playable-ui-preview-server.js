import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { stripTypeScriptTypes } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  continuePlayableNewGMModeGame,
  createPlayableSaveApiStatus,
  savePlayableNewGMModeGame,
} from "./playable-save-api-controller.js";

const repoRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const uiRoute = "/ui/playable-new-gm-mode/";
const saveApiRoute = "/api/playable-new-gm-mode/save";
const preferredPorts = [5173, 4173, 3000];
const requestedPort = Number.parseInt(process.env.PORT || "", 10);
const portsToTry = Number.isInteger(requestedPort)
  ? [requestedPort]
  : preferredPorts;

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".ts", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webp", "image/webp"],
]);

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, "http://localhost");
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === "/" || pathname === "/ui/playable-new-gm-mode") {
    return {
      redirect: uiRoute,
    };
  }

  if (!pathname.startsWith(uiRoute) && !pathname.startsWith("/src/")) {
    return undefined;
  }

  const relativePath = pathname === uiRoute
    ? "ui/playable-new-gm-mode/index.html"
    : pathname.slice(1);
  const filePath = path.resolve(repoRoot, relativePath);

  if (!filePath.startsWith(repoRoot + path.sep)) {
    return undefined;
  }

  return { filePath };
}

async function handleRequest(request, response) {
  if (request.url?.startsWith(saveApiRoute)) {
    await handleSaveApiRequest(request, response);
    return;
  }

  const resolved = resolveRequestPath(request.url || "/");

  if (!resolved) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  if (resolved.redirect) {
    response.writeHead(302, { Location: resolved.redirect });
    response.end();
    return;
  }

  try {
    const fileStat = await stat(resolved.filePath);
    if (!fileStat.isFile()) {
      throw new Error("Not a file");
    }

    const contentType =
      contentTypes.get(path.extname(resolved.filePath).toLowerCase()) ||
      "application/octet-stream";

    if (path.extname(resolved.filePath).toLowerCase() === ".ts") {
      const source = await readFile(resolved.filePath, "utf8");
      const transformed = stripTypeScriptTypes(source);

      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Length": Buffer.byteLength(transformed),
        "Content-Type": contentType,
      });
      response.end(transformed);
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": fileStat.size,
      "Content-Type": contentType,
    });
    createReadStream(resolved.filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

async function handleSaveApiRequest(request, response) {
  const url = new URL(request.url || "/", "http://localhost");

  try {
    if (request.method === "GET" && url.pathname === `${saveApiRoute}/status`) {
      sendJson(response, 200, createPlayableSaveApiStatus());
      return;
    }

    if (request.method === "GET" && url.pathname === saveApiRoute) {
      const result = continuePlayableNewGMModeGame({
        saveId: url.searchParams.get("saveId") || undefined,
      });
      sendJson(response, result.ok ? 200 : 404, result);
      return;
    }

    if (request.method === "POST" && url.pathname === saveApiRoute) {
      const body = await readJsonBody(request);
      const result = savePlayableNewGMModeGame({
        gameplayStateModel: body.gameplayStateModel,
        saveId: body.saveId,
      });
      sendJson(response, result.ok ? 200 : 400, result);
      return;
    }

    sendJson(response, 404, { ok: false, status: "not-found" });
  } catch {
    sendJson(response, 400, { ok: false, status: "bad-request" });
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on("data", (chunk) => {
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, body) {
  const serialized = JSON.stringify(body);

  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(serialized),
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(serialized);
}

function createPreviewServer(port) {
  return new Promise((resolve, reject) => {
    const server = createServer((request, response) => {
      void handleRequest(request, response);
    });

    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.off("error", reject);
      resolve(server);
    });
  });
}

let activeServer;
let lastError;
for (const port of portsToTry) {
  try {
    activeServer = await createPreviewServer(port);
    const url = `http://localhost:${port}${uiRoute}`;
    console.log(`Playable New GM Mode preview serving at ${url}`);
    console.log("First screen: Game Landing / Title Screen");
    console.log("Press Ctrl+C to stop.");
    lastError = undefined;
    break;
  } catch (error) {
    lastError = error;
    if (error?.code !== "EADDRINUSE") {
      throw error;
    }
  }
}

if (lastError) {
  console.error(
    `Unable to start preview server on ports: ${portsToTry.join(", ")}`,
  );
  process.exitCode = 1;
}

process.on("SIGINT", () => {
  activeServer?.close(() => {
    process.exit(0);
  });
});
