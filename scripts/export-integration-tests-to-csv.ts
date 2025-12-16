import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/*
Usage:
  pnpm ts-node scripts/export-integration-tests-to-csv.ts
Outputs CSVs to docs/csv/
*/

function sanitizeModuleName(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function parseTables(md: string) {
  const modules: { title: string; rows: string[][] }[] = [];
  // Match: ## Title, then any whitespace, then ID|..., then -|..., then capture data rows until next ## or end
  const sectionRegex =
    /##\s+([^\n]+)\s+ID\|[^\n]*\n-\|[^\n]*\n([\s\S]*?)(?=(?:\n##\s)|$)/g;

  let match: RegExpExecArray | null;
  match = sectionRegex.exec(md);
  while (match !== null) {
    const title = match[1].trim();
    const tableContent = match[2].trim();

    if (tableContent) {
      const lines = tableContent
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const rows = lines.map((l) => l.split("|").map((c) => c.trim()));
      modules.push({ title, rows });
    }

    match = sectionRegex.exec(md);
  }

  return modules;
}

function toCsvCell(s: string) {
  const needsQuotes = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function writeCsv(title: string, rows: string[][], outDir: string) {
  const header = [
    "ID",
    "Test Case Description",
    "Test Case Procedure",
    "Expected Output",
    "Inter-test case Dependence",
    "Result",
    "Test date",
    "Note",
  ];

  const csv = [header, ...rows]
    .map((r) => r.map((c) => toCsvCell(c)).join(","))
    .join("\n");

  const fname = `${sanitizeModuleName(title)}.csv`;
  writeFileSync(resolve(outDir, fname), csv, "utf8");
}

(function main() {
  const mdPath = resolve("docs/integration-test-matrix.md");
  const outDir = resolve("docs/csv");

  const md = readFileSync(mdPath, "utf8");
  mkdirSync(outDir, { recursive: true });

  const modules = parseTables(md);
  if (modules.length === 0) {
    console.error("No tables found in markdown.");
    process.exit(1);
  }

  for (const m of modules) {
    writeCsv(m.title, m.rows, outDir);
  }

  console.log(`Exported ${modules.length} CSV files to ${outDir}`);
})();
