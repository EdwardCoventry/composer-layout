// Simple CSS duplicate scanner: reports duplicate selectors and repeated declarations within the same selector.
// Heuristic parser (no external deps). Handles nested blocks poorly; intended for flat CSS.

const fs = require('fs');
const path = require('path');

function scanFile(cssPath) {
  const css = fs.readFileSync(cssPath, 'utf8');
  const len = css.length;
  const reports = [];

  let i = 0;
  while (i < len) {
    // find next '{'
    const startBrace = css.indexOf('{', i);
    if (startBrace === -1) break;
    // selector is text before '{' back to previous '}' or start
    let selStart = startBrace - 1;
    while (selStart > 0 && css[selStart] !== '}' && css[selStart] !== '\n') selStart--;
    const selector = css.slice(selStart + 1, startBrace).trim();
    // find matching '}' accounting for nested
    let depth = 1;
    let j = startBrace + 1;
    while (j < len && depth > 0) {
      const ch = css[j];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      j++;
    }
    const block = css.slice(startBrace + 1, j - 1);
    // collect declarations only at depth 1 (heuristic: we already sliced block)
    const decls = [];
    const declMap = new Map();
    const lines = block.split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/\s*([\w-]+)\s*:\s*([^;]+);/);
      if (m) {
        const prop = m[1].trim();
        const val = m[2].trim();
        decls.push({ prop, val });
        if (!declMap.has(prop)) declMap.set(prop, new Map());
        const valMap = declMap.get(prop);
        valMap.set(val, (valMap.get(val) || 0) + 1);
      }
    }
    reports.push({ selector, decls, declMap });
    i = j;
  }

  const selectorCount = new Map();
  for (const r of reports) {
    const s = r.selector;
    selectorCount.set(s, (selectorCount.get(s) || 0) + 1);
  }
  const duplicateSelectors = Array.from(selectorCount.entries()).filter(([, c]) => c > 1);

  const duplicateProps = [];
  for (const r of reports) {
    for (const [prop, valMap] of r.declMap.entries()) {
      // duplicate property if declared more than once (regardless of value)
      const totalCount = Array.from(valMap.values()).reduce((a, b) => a + b, 0);
      if (totalCount > 1) {
        duplicateProps.push({ selector: r.selector, prop, count: totalCount });
      }
    }
  }

  return { duplicateSelectors, duplicateProps };
}

function main() {
  const repoRoot = process.cwd();
  const cssPath = path.resolve(repoRoot, 'apps/ai-assistant-example/src/index.css');
  if (!fs.existsSync(cssPath)) {
    console.error('CSS file not found:', cssPath);
    process.exit(1);
  }
  const result = scanFile(cssPath);
  console.log('Duplicate selectors:', result.duplicateSelectors.length);
  for (const [selector, count] of result.duplicateSelectors.slice(0, 50)) {
    console.log(`- ${selector} (x${count})`);
  }
  console.log('\nDuplicate properties within selectors:', result.duplicateProps.length);
  for (const dp of result.duplicateProps.slice(0, 100)) {
    console.log(`- ${dp.selector} :: ${dp.prop} (x${dp.count})`);
  }
  console.log('\nTip: For robust linting, consider Stylelint with rules: no-duplicate-selectors and declaration-block-no-duplicate-properties.');
}

if (require.main === module) {
  main();
}
