import { GitProxy } from "./GitProxy.js";
import { WebServer } from "./WebServer.js";
import { existsDirSync, fetchJSON } from "./WebUtil.js";

const settings = await fetchJSON("settings.json");

const REPO_PATH = settings?.repoPath || "repo/";
const IP_WHITELIST = settings?.ipWhiteList || { "::1": { "name": "me" }};
const PORT = settings?.port || 7005;

class GitServer extends WebServer {
  async handle(req) {
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
      const pservice = req.getQueryParam("service");
      console.log(REPO_PATH + repo)
      if (pservice == "git-receive-pack" && !existsDirSync(REPO_PATH + repo)) {
        await GitProxy.init(REPO_PATH + repo);
      }
      const res = await GitProxy.service(pservice, true, REPO_PATH + repo);
      return this.createResponseGitAdvertise(res, pservice, "advertisement");
    }

    const text = new Uint8Array(await req.arrayBuffer());
    const res = await GitProxy.service(service, false, REPO_PATH + repo, text);
    return this.createResponseGit(res, service, "result");
  }

  createResponseGitAdvertise(text, service, type) {
    text = new TextDecoder().decode(text);
    const code = service == "git-upload-pack" ? "001e" : "001f";
    return this.createResponse(
      code + "# service=" + service + "\n0000" + text,
      "application/x-" + service + "-" + type,
    );
  }
  createResponseGit(text, service, type) {
    return this.createResponse(text, "application/x-" + service + "-" + type);
  }
}
new GitServer(PORT);
