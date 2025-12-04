/* Stylelint report generator: lints CSS across the monorepo and writes
 * - .reports/stylelint.json (raw results)
 * - .reports/stylelint-summary.txt (human-readable summary)
 */
const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');

async function main() {
  const repoRoot = process.cwd();
  const reportsDir = path.join(repoRoot, '.reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  // Lint all CSS files across apps and packages
  const files = [
    'packages/**/*.css',
    'apps/**/*.css',
    '**/*.css'
  ];

  let result;
  try {
    result = await stylelint.lint({
      files,
      formatter: 'json',
    });
  } catch (err) {
    const errFile = path.join(reportsDir, 'stylelint-error.txt');
    fs.writeFileSync(errFile, String(err && err.stack || err));
    console.error('Stylelint run failed. See', errFile);
    process.exitCode = 1;
    return;
  }

  const jsonPath = path.join(reportsDir, 'stylelint.json');
  const txtPath = path.join(reportsDir, 'stylelint-summary.txt');

  const raw = result.output || '';
  fs.writeFileSync(jsonPath, raw);

  let summary = [];
  let parsed = [];
  try {
    parsed = raw ? JSON.parse(raw) : [];
  } catch {
    summary.push('Failed to parse JSON output from stylelint.');
  }

  const allWarnings = [];
  let filesChecked = 0;
  for (const fileRes of parsed) {
    filesChecked++;
    if (Array.isArray(fileRes.warnings)) {
      for (const w of fileRes.warnings) {
        allWarnings.push({
          source: fileRes.source,
          line: w.line,
          column: w.column,
          rule: w.rule,
          severity: w.severity,
          text: w.text,
        });
      }
    }
  }

  const total = allWarnings.length;
  const byRule = allWarnings.reduce((acc, w) => {
    acc[w.rule] = (acc[w.rule] || 0) + 1;
    return acc;
  }, {});

  summary.push(`Files checked: ${filesChecked}`);
  summary.push(`Total issues: ${total}`);
  if (total > 0) {
    summary.push('By rule:');
    for (const [rule, count] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) {
      summary.push(`- ${rule}: ${count}`);
    }
    summary.push('Details:');
    for (const w of allWarnings.slice(0, 200)) {
      summary.push(`${w.severity.toUpperCase()} ${w.rule} ${w.source}:${w.line}:${w.column} - ${w.text}`);
    }
    if (allWarnings.length > 200) {
      summary.push(`... (${allWarnings.length - 200} more)`);
    }
  } else {
    summary.push('Stylelint found no issues.');
  }

  fs.writeFileSync(txtPath, summary.join('\n'));
  console.log(`Wrote reports:\n- ${path.relative(repoRoot, jsonPath)}\n- ${path.relative(repoRoot, txtPath)}`);
}

main();
