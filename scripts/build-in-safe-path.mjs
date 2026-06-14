import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const drives = "ZYXWVUTSRQPONMLKJIHGFED".split("");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    shell: false,
    stdio: "inherit",
    windowsHide: true,
    ...options,
  });

  if (result.error) {
    console.error(result.error.message);
  }

  return result;
}

function findFreeDrive() {
  return drives.find((drive) => !existsSync(`${drive}:\\`));
}

const drive = findFreeDrive();

if (!drive) {
  console.error("No free drive letter is available for the build path workaround.");
  process.exit(1);
}

const driveRoot = `${drive}:`;
const subst = run("cmd.exe", ["/c", "subst", driveRoot, cwd]);

if (subst.status !== 0) {
  console.error(`Failed to map ${cwd} to ${driveRoot}`);
  process.exit(subst.status ?? 1);
}

try {
  const nextCmd = join(`${drive}:\\`, "node_modules", ".bin", "next.cmd");
  const build = run("cmd.exe", ["/c", nextCmd, "build", "--webpack"], {
    cwd: `${drive}:\\`,
  });
  if (build.status !== 0) {
    console.error(`Next build failed from ${drive}:\\`);
  }
  process.exitCode = build.status ?? 1;
} finally {
  run("cmd.exe", ["/c", "subst", driveRoot, "/D"], { stdio: "ignore" });
}
