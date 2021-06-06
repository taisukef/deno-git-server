import { getQueryParam, parseURL } from "./WebUtil.js";

class WebServer {
  constructor(port) {
    this.start(port);
  }
  async start(port) {
    console.log(`http://localhost:${port}/`);

    const hostname = "::";
    const err = new TextEncoder().encode("not found");

    for await (const conn of Deno.listen({ port, hostname })) {
      (async () => {
        const remoteAddr = conn.remoteAddr.hostname;
        for await (const res of Deno.serveHttp(conn)) {
          const req = res.request;
          const url = req.url;
          const purl = parseURL(url);
          if (!purl) {
            continue;
          }
          req.path = purl.path;
          req.query = purl.query;
          req.host = purl.host;
          req.port = purl.port;
          req.remoteAddr = remoteAddr;
          req.getQueryParam = (name) => getQueryParam(req.query, name);

          const resd = await this.handle(req);
          if (resd) {
            res.respondWith(resd);
          } else {
            res.respondWith(new Response(err));
          }
        }
      })();
    }
  }
  createResponse(text, ctype = "text/plain; charset=utf-8") {
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
  }
  async handle(req) {
    return null;
  }
}

export { WebServer };
