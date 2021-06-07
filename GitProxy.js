class GitProxy {
  static async service(service, advertise, gitpath, data) {
    const cmd = ["git"];
    if (service) {
      cmd.push(service.substring(4));
    }
    cmd.push("--stateless-rpc");
    if (advertise) {
      cmd.push("--advertise-refs");
    }
    cmd.push(gitpath);
    const p = Deno.run({
      cmd,
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    });
    if (data) {
      //await p.stdin.writeAll(data);
      await Deno.writeAll(p.stdin, data);
      await p.stdin.close();
    }
    const output = await p.output();
    const error = await p.stderrOutput();
    const errorStr = new TextDecoder().decode(error);
    p.close();
    //console.log("stdout", new TextDecoder().decode(output));
    if (errorStr) {
      console.log("stderr", errorStr)
    }
    return output;
  }
  static async init(gitpath, bare = true) {
    const basedir = gitpath.substring(0, gitpath.lastIndexOf("/"));
    try {
      Deno.mkdirSync(basedir);
    } catch (e) {
    }

    const cmd = ["git"];
    cmd.push("init");
    if (bare) {
      cmd.push("--bare");
    }
    cmd.push(gitpath + ".git");
    const p = Deno.run({
      cmd,
      stdout: "piped",
      stderr: "piped",
    });
    const output = await p.output();
    const outStr = new TextDecoder().decode(output);

    const error = await p.stderrOutput();
    const errorStr = new TextDecoder().decode(error);
    p.close();
    //console.log("stdout", outStr);
    //console.log("stderr", errorStr);
  }
}

export { GitProxy };
