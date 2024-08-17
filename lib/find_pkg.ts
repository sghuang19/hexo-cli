import { resolve, join, dirname } from 'path';
import { readFileSync, existsSync } from 'hexo-fs';
import { load } from 'js-yaml';

interface findPkgArgs {
  cwd?: string;
}

function findPkg(cwd: string, args: findPkgArgs = {}) {
  if (args.cwd) {
    cwd = resolve(cwd, args.cwd);
  }

  return checkPkg(cwd);
}

/** Returns { path, hexoVer, pkgVer }, or null */
async function checkPkg(path: string): Promise<object | null> {
  // if a pkg file exists, and the hexo key in it is non-empty
  const pkgInfo = readPkg(join(path, 'package.json'), JSON.parse)
               || readPkg(join(path, 'package.yaml'), load);
  if (pkgInfo) { return { path, ...pkgInfo }; }
  // otherwise, search in parent dir, terminate at root
  const parent = dirname(path);
  return parent === path ? null : checkPkg(parent);
}

/** If pkg file exists, read it, parse it, and access the hexo object in it */
function readPkg(pkgPath: string, parser: CallableFunction): object | null {
  if (!existsSync(pkgPath)) { return null; }
  const pkg = parser(readFileSync(pkgPath));
  return pkg && pkg.hexo // make sure pkg.hexo is truthy
    ? { hexoVer: pkg.hexo.version, pkgVer: pkg.version }
    : null;
}

export = findPkg;
