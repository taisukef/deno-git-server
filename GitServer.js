import { GitProxy } from "./GitProxy.js";
import { existsDirSync, fetchJSON } from "./WebUtil.js";
import { serve } from "https://deno.land/std@0.173.0/http/server.ts";

const settings = await fetchJSON("settings.json");

const REPO_PATH = settings?.repoPath || "repo/";
const IP_WHITELIST = settings?.ipWhiteList || { "::1": { "name": "me" }};
const PORT = settings?.port || 7005;

const createResponse = (text, ctype = "text/plain; charset=utf-8") => {
  return new Response(text, {
    status: 200,
    headers: new Headers({
      "Content-Type": ctype,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      // "Access-Control-Allow-Methods": "PUT, DELETE, PATCH",
      "Connection": "close",
    }),
  });
};

const createResponseGitAdvertise = (text, service, type) => {
  text = new TextDecoder().decode(text);
  const code = service == "git-upload-pack" ? "001e" : "001f";
  return createResponse(
    code + "# service=" + service + "\n0000" + text,
    "application/x-" + service + "-" + type,
  );
}
const createResponseGit = (text, service, type) => {
  return createResponse(text, "application/x-" + service + "-" + type);
};

const hostname = "::";

serve(async (req, conn) => {
  const url = new URL(req.url);
  req.path = url.pathname;
  req.param = url.searchParams;
  req.remoteAddr = conn.remoteAddr.hostname;
  const name = IP_WHITELIST[req.remoteAddr];
  console.log("access from " + JSON.stringify(name) + " - req.remoteAddr " + req.remoteAddr);
  if (!name) {
    return null;
  }
  //console.log(req);

  const n = req.path.indexOf("/", 1);
  const repo = req.path.substring(1, n);
  if (repo.indexOf("..") >= 0) {
    return null;
  }
  const service = req.path.substring(n + 1);

  if (service == "info/refs") {
    const pservice = req.param.get("service");
    console.log(REPO_PATH + repo)
    if (pservice == "git-receive-pack" && !existsDirSync(REPO_PATH + repo)) {
      await GitProxy.init(REPO_PATH + repo);
    }
    const res = await GitProxy.service(pservice, true, REPO_PATH + repo);
    return createResponseGitAdvertise(res, pservice, "advertisement");
  }

  const text = new Uint8Array(await req.arrayBuffer());
  const res = await GitProxy.service(service, false, REPO_PATH + repo, text);
  return createResponseGit(res, service, "result");
}, { port: PORT, hostname });
