import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import config from "../utilities/config.js";

// ---------------------------------------------------------------------------
// Konfigurasi
// ---------------------------------------------------------------------------
const TS_PREFIX = "TS";
const TS_NUMBER = 194; // nomor tiket/sprint, jadi bagian TC ID: TS-194-1, TS-194-2, ...

const ROOT = path.resolve(import.meta.dirname, "..");
const RESULT_FILE = path.join(ROOT, "reports", "tdd", "tdd-result.json");
const OUTPUT_DIR = path.join(ROOT, "reports");

const BASE = config.baseUrl;
const STORE_URL = `${BASE}/store/gramedia-balikpapan`;

const TEST_SHEET = "Test Case TDD";
const BUG_SHEET = "Bug Report";

// ---------------------------------------------------------------------------
// Helper teks
// ---------------------------------------------------------------------------
const readData = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, "data", "bva", name), "utf8"));
const numbered = (...lines) => lines.map((line, i) => `${i + 1}. ${line}`).join("\n");
const boundary = (description) => description.match(/\((m(?:in|ax)(?:[-+]1)?)\)/)?.[1] ?? "boundary";
const chars = (n) => `${n} character${n === 1 ? "" : "s"}`;
const idr = (n) => Number(n).toLocaleString("id-ID");
const priorityOf = (c) => (c.class === "invalid" ? "P2-High" : "P3-Medium");

// ---------------------------------------------------------------------------
// Definisi test case: id otomasi -> isi baris di sheet
// ---------------------------------------------------------------------------
const definitions = new Map();
const define = (key, def) => definitions.set(key, { pre: "-", ...def });

const REGISTER_PRE =
    'User is not logged in. Register form (email field and terms checkbox) is opened from the homepage via the navbar "Daftar" button.';
const registerOpen = [
    `Access the web application URL ${BASE}`,
    'Click the "Daftar" button in the navbar until the register form is displayed',
];

// --- Test statis (tanpa ID BVA) -------------------------------------------
const pageLoad = (moduleKey, module, url) =>
    define(`${moduleKey}::opens the page and shows the Gramedia title`, {
        module,
        subModule: "Page Load",
        priority: "P1-Critical",
        title: "Verify the page opens and shows the Gramedia title",
        steps: numbered(
            `Access the web application URL ${url}`,
            "Wait until the page is rendered",
            "Observe the page content and the browser tab title",
        ),
        expected: 'The page body is visible and the browser tab title contains "Gramedia".',
    });

pageLoad("register", "Register", BASE);
pageLoad("search", "Catalog", BASE);
pageLoad("price", "Catalog", STORE_URL);

define("register::goes to the register page until the form is visible", {
    module: "Register",
    subModule: "Navigation",
    priority: "P1-Critical",
    pre: "User is not logged in",
    title: "Verify user can navigate from the homepage to the register form",
    steps: numbered(
        `Access the web application URL ${BASE}`,
        'Click the "Daftar" button in the navbar',
        "Observe the URL, the page title and the register form",
    ),
    expected:
        'URL contains "register", the register form is visible and the page title contains "Masuk ke akun Gramedia".',
});

define("AUTH-PRE-01", {
    module: "Register",
    subModule: "Terms Checkbox",
    priority: "P1-Critical",
    pre: REGISTER_PRE,
    title: "Verify Daftar button stays disabled while terms are unchecked and is enabled after checking",
    steps: numbered(
        ...registerOpen,
        "Fill the email field with a valid email but leave the terms checkbox unchecked",
        'Observe the state of the "Daftar" button',
        "Check the terms checkbox",
        'Observe the state of the "Daftar" button again',
    ),
    expected:
        'The "Daftar" button is disabled while the terms are unchecked and becomes enabled after the terms are checked.',
});

// --- Catalog: search keyword ------------------------------------------------
const catalog = readData("catalog.json");
const searchExpected = {
    rejected:
        'The minimum-length toast ("minimum 3 karakter") is displayed and the page does not navigate to the search results page.',
    truncated: "The search box keeps only 50 characters; the extra character is not accepted.",
};

for (const c of catalog.cases) {
    const typeOnly = c.expect === "truncated";
    define(c.id, {
        module: "Catalog",
        subModule: "Search Keyword",
        priority: priorityOf(c),
        title: `Verify search with ${chars(c.length)} (${boundary(c.description)})`,
        steps: numbered(
            `Access the web application URL ${BASE}`,
            `Type a keyword of ${chars(c.length)} ("a" repeated ${c.length} times) into the navbar search box`,
            ...(typeOnly
                ? ["Observe the number of characters kept in the search box"]
                : ["Press ENTER", "Observe the toast message and the page URL"]),
        ),
        expected:
            searchExpected[c.expect] ??
            `The user is redirected to the search results page and the URL contains "q=" followed by the ${chars(c.length)} keyword.`,
    });
}

// --- Catalog: price filter --------------------------------------------------
const price = readData("price.json");

function definePriceCase(c, kind) {
    const label = kind === "min" ? "Min price" : "Max price";
    const param = `${kind}_price`;
    const byUrl = c.channel === "url";
    const action = byUrl ? `opening URL with ${param}=${c.value}` : `typing ${c.value}`;

    let expected;
    if (byUrl) {
        expected = `The ${label.toLowerCase()} input stays empty${c.expectedParam === null ? ` and the "${param}" parameter is removed from the URL` : ""}.`;
    } else if (c.expectedParam === null) {
        expected = `The ${label.toLowerCase()} input stays empty and the URL has no "${param}" parameter.`;
    } else {
        expected = `The ${label.toLowerCase()} input shows "${idr(c.expectedInput)}" and the URL contains ${param}=${c.expectedParam}.`;
    }

    define(c.id, {
        module: "Catalog",
        subModule: `Price Filter - ${kind === "min" ? "Min" : "Max"}`,
        priority: priorityOf(c),
        title: `Verify ${label.toLowerCase()} filter when ${action} (${boundary(c.description)})`,
        steps: byUrl
            ? numbered(
                  `Open ${STORE_URL}?${param}=${c.value}`,
                  `Observe the ${label.toLowerCase()} input value and the URL query parameter "${param}"`,
              )
            : numbered(
                  `Access the store catalog page ${STORE_URL}`,
                  `Type "${c.value}" into the ${label.toLowerCase()} input`,
                  `Observe the ${label.toLowerCase()} input value and the URL query parameter "${param}"`,
              ),
        expected,
    });
}

for (const c of price.minCases) definePriceCase(c, "min");
for (const c of price.maxCases) definePriceCase(c, "max");

for (const c of price.rangeCases) {
    define(c.id, {
        module: "Catalog",
        subModule: "Price Filter - Range",
        priority: priorityOf(c),
        title: `Verify price range with min=${c.min} and max=${c.max}`,
        steps: numbered(
            `Access the store catalog page ${STORE_URL}`,
            `Type "${c.min}" into the min price input`,
            `Type "${c.max}" into the max price input`,
            "Observe both inputs and the URL query parameters",
        ),
        expected: `Both parameters are applied (min_price=${c.expectedMinParam}, max_price=${c.expectedMaxParam}) and both inputs show the typed values.${c.min > c.max ? " The site does not block the inverted range." : ""}`,
    });
}

// --- Register: email --------------------------------------------------------
const register = readData("register.json");

function defineRegisterSubmitCase(c) {
    const enabled = c.expectedSubmitEnabled;
    const replaceStep = c.length === 0 ? "Clear the email field" : `Replace the email value with ${chars(c.length)}`;

    define(c.id, {
        module: "Register",
        subModule: "Email",
        priority: priorityOf(c),
        pre: REGISTER_PRE,
        title: `Verify Daftar button is ${enabled ? "enabled" : "disabled"} when email has ${chars(c.length)} (${boundary(c.description)})`,
        steps: enabled
            ? numbered(
                  ...registerOpen,
                  `Fill the email field with ${chars(c.length)}`,
                  "Check the terms checkbox",
                  'Observe the state of the "Daftar" button',
              )
            : numbered(
                  ...registerOpen,
                  'Fill the email field with a valid email and check the terms checkbox (control: the "Daftar" button is enabled)',
                  replaceStep,
                  'Observe the state of the "Daftar" button',
              ),
        expected: `The "Daftar" button is ${enabled ? "enabled" : "disabled"}.`,
    });
}

function defineRegisterMaxCase(c) {
    define(c.id, {
        module: "Register",
        subModule: "Email",
        priority: priorityOf(c),
        pre: REGISTER_PRE,
        title: `Verify email field with ${chars(c.length)} (${boundary(c.description)})`,
        steps: numbered(
            ...registerOpen,
            `Type ${chars(c.length)} into the email field`,
            "Check the terms checkbox",
            'Observe the number of characters kept in the email field and the state of the "Daftar" button',
        ),
        expected:
            c.expect === "truncated"
                ? `The field is truncated to ${chars(c.expectedLength)}; the extra character is not accepted.`
                : `All ${chars(c.expectedLength)} are kept in the field and the "Daftar" button is enabled.`,
    });
}

for (const c of register.emailMinCases) defineRegisterSubmitCase(c);
for (const c of register.emailCases) defineRegisterMaxCase(c);

// ---------------------------------------------------------------------------
// Baca hasil mochawesome
// ---------------------------------------------------------------------------
const ID_PATTERN = /^([A-Z]+(?:-[A-Z]+)*-[A-Z]?\d+):\s*/;

const moduleKeyOf = (fullTitle) =>
    fullTitle.includes("Register") ? "register" : fullTitle.includes("Price Filter") ? "price" : "search";

function collectTests(suite, out = []) {
    out.push(...(suite.tests ?? []));
    for (const child of suite.suites ?? []) collectTests(child, out);
    return out;
}

function parseContext(raw) {
    if (!raw) return [];
    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        return [];
    }
}

function toRow(test) {
    const automationId = ID_PATTERN.exec(test.title)?.[1] ?? null;
    const def = (automationId && definitions.get(automationId)) ||
        definitions.get(`${moduleKeyOf(test.fullTitle)}::${test.title}`) || {
            module: "Unmapped",
            subModule: "-",
            priority: "P3-Medium",
            pre: "-",
            title: `Verify ${test.title}`,
            steps: "Refer to the spec file (test case is not mapped in scripts/generate-tdd-report.js)",
            expected: "Refer to the spec file",
        };

    const context = parseContext(test.context);
    const contextValues = (title) =>
        context.filter((entry) => entry?.title === title).map((entry) => String(entry.value));

    return {
        ...def,
        automationId: automationId ?? "-",
        result: test.pass ? "Passed" : test.fail ? "Failed" : "Skipped",
        minutes: Math.round((test.duration / 60000) * 100) / 100,
        error: test.err?.message ? String(test.err.message).split("\n")[0].slice(0, 400) : "",
        defects: contextValues("Defect Candidate"),
        screenshot: contextValues("Screenshot")[0] ?? "",
    };
}

// ---------------------------------------------------------------------------
// Styling
// ---------------------------------------------------------------------------
const FONT = "Arial";
const font = (extra = {}) => ({ name: FONT, size: 10, ...extra });
const LINE = { style: "thin", color: { argb: "FFBFBFBF" } };
const BORDER = { top: LINE, left: LINE, bottom: LINE, right: LINE };
const BANDS = ["FFFFFFFF", "FFF3F6FA"];
const GOLD = "FFFFC000";
const YELLOW = "FFFFFF00";
const NAVY = "FF1F3864";
const MAX_ROW = 500; // dropdown dan conditional formatting berlaku sampai baris ini, supaya baris manual ikut

const argb = (hex) => ({ argb: hex });
const solid = (hex) => ({ type: "pattern", pattern: "solid", fgColor: argb(hex) });

const PRIORITY_STYLE = {
    "P1-Critical": { bg: "FFC00000", fg: "FFFFFFFF" },
    "P2-High": { bg: "FFF4CCCC", fg: "FFC00000" },
    "P3-Medium": { bg: "FFFFE599", fg: "FF7F6000" },
    "P4-Low": { bg: "FFCFE2F3", fg: "FF1155CC" },
};
const RESULT_STYLE = {
    Passed: { bg: "FF6AA84F", fg: "FFFFFFFF" },
    Failed: { bg: "FFC00000", fg: "FFFFFFFF" },
    Blocked: { bg: "FFF1C232", fg: "FF3D3D3D" },
    Skipped: { bg: "FF999999", fg: "FFFFFFFF" },
};
const SEVERITY_STYLE = {
    Critical: PRIORITY_STYLE["P1-Critical"],
    High: PRIORITY_STYLE["P2-High"],
    Medium: PRIORITY_STYLE["P3-Medium"],
    Low: PRIORITY_STYLE["P4-Low"],
};
const BUG_STATUS_STYLE = {
    Open: { bg: "FFC00000", fg: "FFFFFFFF" },
    "In Progress": { bg: "FFF1C232", fg: "FF3D3D3D" },
    Fixed: { bg: "FF6AA84F", fg: "FFFFFFFF" },
    Closed: { bg: "FF999999", fg: "FFFFFFFF" },
};
const SEVERITY = { "P1-Critical": "Critical", "P2-High": "High", "P3-Medium": "Medium", "P4-Low": "Low" };

function badge(cell, style) {
    cell.fill = solid(style.bg);
    cell.font = font({ bold: true, color: argb(style.fg) });
}

// Conditional formatting supaya warna ikut berubah saat dropdown diganti manual.
function addBadgeRules(ws, column, firstRow, styles) {
    ws.addConditionalFormatting({
        ref: `${column}${firstRow}:${column}${MAX_ROW}`,
        rules: Object.entries(styles).map(([label, style], i) => ({
            type: "expression",
            priority: i + 1,
            formulae: [`$${column}${firstRow}="${label}"`],
            style: {
                font: { bold: true, color: argb(style.fg) },
                fill: { type: "pattern", pattern: "solid", bgColor: argb(style.bg) },
            },
        })),
    });
}

function styleHeader(row, columns, yellowFrom = Number.POSITIVE_INFINITY) {
    for (let col = 1; col <= columns; col++) {
        const cell = row.getCell(col);
        cell.font = font({ bold: true, color: argb("FF000000") });
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = BORDER;
        cell.fill = solid(col >= yellowFrom ? YELLOW : GOLD);
    }
    row.height = 32;
}

// Estimasi tinggi baris dari isi sel yang di-wrap, supaya tampilan sama di Excel, Google Sheets, dan LibreOffice.
function rowHeight(values, widths) {
    let maxLines = 1;
    values.forEach((text, i) => {
        const width = widths[i] ?? 10;
        const lines = String(text ?? "")
            .split("\n")
            .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / (width * 1.1))), 0);
        maxLines = Math.max(maxLines, lines);
    });
    return Math.min(409, Math.max(24, maxLines * 13 + 8));
}

// ---------------------------------------------------------------------------
// Build workbook
// ---------------------------------------------------------------------------
const TEST_HEADERS = [
    ["No", 5],
    ["TC ID", 12],
    ["Modul", 12],
    ["Sub Modul", 20],
    ["Test Case Title", 42],
    ["Priority", 14],
    ["Pre Test Scenario / Pre-condition", 30],
    ["Test Scenario / Test Steps", 58],
    ["Expected result", 46],
    ["Duration (Minutes)", 13],
    ["Test Result", 13],
    ["Notes", 38],
    ["Automation ID", 16],
];
const BUG_HEADERS = [
    ["Bug ID", 11],
    ["TC ID", 12],
    ["Modul", 12],
    ["Bug Title", 44],
    ["Severity", 11],
    ["Steps to Reproduce", 56],
    ["Expected Result", 44],
    ["Actual Result", 50],
    ["Evidence (Screenshot)", 40],
    ["Status", 12],
    ["Reported Date", 14],
];

function buildTestSheet(wb, rows, bugs) {
    const ws = wb.addWorksheet(TEST_SHEET, {
        views: [{ state: "frozen", xSplit: 2, ySplit: 2 }],
        properties: { tabColor: argb(GOLD) },
        pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });
    const widths = TEST_HEADERS.map(([, width]) => width);
    TEST_HEADERS.forEach(([title, width], i) => {
        ws.getColumn(i + 1).width = width;
        ws.getCell(2, i + 1).value = title;
    });
    styleHeader(ws.getRow(2), TEST_HEADERS.length - 1, 12);
    // Kolom tambahan (Automation ID) dibedakan dari kolom template.
    ws.getCell(2, 13).font = font({ bold: true, color: argb("FFFFFFFF") });
    ws.getCell(2, 13).fill = solid(NAVY);
    ws.getCell(2, 13).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    ws.getCell(2, 13).border = BORDER;

    ws.getCell("A1").value = TS_PREFIX;
    ws.getCell("B1").value = TS_NUMBER;
    ws.getCell("A1").font = font({ bold: true, size: 11 });
    ws.getCell("B1").font = font({ bold: true, size: 11 });
    ws.getCell("B1").alignment = { horizontal: "right" };
    ws.getCell("E1").value = "Gramedia.com - Boundary Value Analysis E2E Test Case Report";
    ws.getCell("E1").font = font({ bold: true, size: 13, color: argb(NAVY) });
    ws.getRow(1).height = 26;
    ws.getRow(1).alignment = { vertical: "middle" };

    const today = new Date().toISOString().slice(0, 10);
    let bugCount = 0;
    let band = 1;
    let previousGroup = "";

    rows.forEach((r, i) => {
        const rowNo = i + 3;
        const no = i + 1;
        const tcId = `${TS_PREFIX}-${TS_NUMBER}-${no}`;
        const row = ws.getRow(rowNo);

        const group = `${r.module}|${r.subModule}`;
        if (group !== previousGroup) band = 1 - band;
        previousGroup = group;

        let notes = r.defects.length ? `Defect candidate: ${r.defects.join(" | ")}` : "";

        if (r.result === "Failed") {
            bugCount += 1;
            const bugId = `BUG-${String(bugCount).padStart(3, "0")}`;
            const actual = [r.error, ...r.defects].filter(Boolean).join("\n");
            bugs.push({
                bugId,
                values: [
                    bugId,
                    tcId,
                    r.module,
                    `[${r.module}] ${r.title}`,
                    SEVERITY[r.priority] ?? "Medium",
                    r.steps,
                    r.expected,
                    actual || "See the mochawesome report",
                    r.screenshot ? path.relative(ROOT, r.screenshot) : "-",
                    "Open",
                    today,
                ],
            });
            notes = { text: `Open: ${bugId}`, hyperlink: `#'${BUG_SHEET}'!A${bugCount + 1}` };
        }

        const values = [
            no,
            { formula: `$A$1&"-"&$B$1&"-"&A${rowNo}`, result: tcId },
            r.module,
            r.subModule,
            r.title,
            r.priority,
            r.pre,
            r.steps,
            r.expected,
            r.minutes,
            r.result,
            notes,
            r.automationId,
        ];
        values.forEach((value, col) => {
            const cell = row.getCell(col + 1);
            cell.value = value;
            cell.font = font(col === 2 ? { bold: true } : {});
            cell.fill = solid(BANDS[band]);
            cell.border = BORDER;
            cell.alignment = {
                vertical: "middle",
                wrapText: true,
                horizontal: [0, 1, 5, 9, 10, 12].includes(col) ? "center" : "left",
            };
        });
        row.getCell(10).numFmt = "0.00";
        if (PRIORITY_STYLE[r.priority]) badge(row.getCell(6), PRIORITY_STYLE[r.priority]);
        if (RESULT_STYLE[r.result]) badge(row.getCell(11), RESULT_STYLE[r.result]);
        if (typeof notes === "object") {
            row.getCell(12).font = font({ color: argb("FF1155CC"), underline: true });
        } else if (notes) {
            row.getCell(12).font = font({ color: argb("FF7F6000"), italic: true });
        }

        const textForHeight = values.map((v) => (typeof v === "object" && v !== null ? (v.text ?? "") : v));
        row.height = rowHeight(textForHeight, widths);
    });

    const lastRow = Math.max(rows.length + 2, 3);
    ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: lastRow, column: TEST_HEADERS.length } };
    addBadgeRules(ws, "F", 3, PRIORITY_STYLE);
    addBadgeRules(ws, "K", 3, RESULT_STYLE);
    return lastRow;
}

function buildBugSheet(wb, bugs) {
    const ws = wb.addWorksheet(BUG_SHEET, {
        views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
        properties: { tabColor: argb("FFC00000") },
        pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });
    const widths = BUG_HEADERS.map(([, width]) => width);
    BUG_HEADERS.forEach(([title, width], i) => {
        ws.getColumn(i + 1).width = width;
        ws.getCell(1, i + 1).value = title;
    });
    styleHeader(ws.getRow(1), BUG_HEADERS.length);

    bugs.forEach((bug, i) => {
        const row = ws.getRow(i + 2);
        bug.values.forEach((value, col) => {
            const cell = row.getCell(col + 1);
            cell.value = value;
            cell.font = font(col === 0 ? { bold: true } : {});
            cell.fill = solid(BANDS[i % 2 === 0 ? 0 : 1]);
            cell.border = BORDER;
            cell.alignment = {
                vertical: "middle",
                wrapText: true,
                horizontal: [0, 1, 4, 9, 10].includes(col) ? "center" : "left",
            };
        });
        badge(row.getCell(5), SEVERITY_STYLE[bug.values[4]] ?? SEVERITY_STYLE.Medium);
        badge(row.getCell(10), BUG_STATUS_STYLE.Open);
        row.height = rowHeight(bug.values, widths);
    });

    ws.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: Math.max(bugs.length + 1, 2), column: BUG_HEADERS.length },
    };
    addBadgeRules(ws, "E", 2, SEVERITY_STYLE);
    addBadgeRules(ws, "J", 2, BUG_STATUS_STYLE);
}

// Sheet Summary: tabel angka di kiri, chart ditempel sesudah workbook ditulis (lihat injectParts).
function buildSummarySheet(wb, rows, lastRow) {
    const ws = wb.addWorksheet("Summary", {
        views: [{ showGridLines: false }],
        properties: { tabColor: argb(NAVY) },
    });
    [34, 12, 12, 12, 12, 3].forEach((width, i) => {
        ws.getColumn(i + 1).width = width;
    });

    const sheet = `'${TEST_SHEET}'`;
    const col = (letter) => `${sheet}!$${letter}$3:$${letter}$${lastRow}`;
    const countOf = (label) => rows.filter((r) => r.result === label).length;
    const total = rows.length;

    const put = (address, value, extra = {}) => {
        const cell = ws.getCell(address);
        cell.value = value;
        cell.font = font(extra.font);
        if (extra.fill) cell.fill = solid(extra.fill);
        if (extra.align) cell.alignment = { vertical: "middle", horizontal: extra.align };
        if (extra.numFmt) cell.numFmt = extra.numFmt;
        if (extra.border !== false) cell.border = BORDER;
        return cell;
    };
    const head = (address, text, style) =>
        put(address, text, {
            fill: style?.bg ?? NAVY,
            font: { bold: true, color: argb(style?.fg ?? "FFFFFFFF") },
            align: "center",
        });

    // Judul
    ws.mergeCells("A1:E1");
    put("A1", "Test Execution Summary", {
        font: { bold: true, size: 15, color: argb("FFFFFFFF") },
        fill: NAVY,
        border: false,
    });
    ws.getRow(1).height = 30;
    ws.getCell("A1").alignment = { vertical: "middle", horizontal: "left", indent: 1 };

    // Info run
    const info = [
        ["Project", "gramedia-bva-e2e"],
        ["Base URL", BASE],
        ["Browser", `${config.browser}${config.headless ? " (headless)" : ""}`],
        ["Executed at", new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })],
    ];
    info.forEach(([label, value], i) => {
        const r = 3 + i;
        ws.mergeCells(`B${r}:E${r}`);
        put(`A${r}`, label, { font: { bold: true }, fill: "FFF3F6FA" });
        put(`B${r}`, value, { align: "left" });
        for (const letter of ["C", "D", "E"]) ws.getCell(`${letter}${r}`).border = BORDER;
    });

    // Hasil keseluruhan (sumber chart donut)
    head("A8", "Result");
    head("B8", "Count");
    head("C8", "%");
    const resultLabels = ["Passed", "Failed", "Skipped"];
    resultLabels.forEach((label, i) => {
        const r = 9 + i;
        put(`A${r}`, label, {
            font: { bold: true, color: argb(RESULT_STYLE[label].fg) },
            fill: RESULT_STYLE[label].bg,
        });
        put(`B${r}`, { formula: `COUNTIF(${col("K")},"${label}")`, result: countOf(label) }, { align: "center" });
        put(
            `C${r}`,
            { formula: `IF($B$12=0,0,B${r}/$B$12)`, result: total ? countOf(label) / total : 0 },
            { align: "center", numFmt: "0.0%" },
        );
    });
    put("A12", "Total", { font: { bold: true }, fill: "FFF3F6FA" });
    put("B12", { formula: "SUM(B9:B11)", result: total }, { font: { bold: true }, align: "center", fill: "FFF3F6FA" });
    put(
        "C12",
        { formula: "SUM(C9:C11)", result: total ? 1 : 0 },
        { font: { bold: true }, align: "center", fill: "FFF3F6FA", numFmt: "0.0%" },
    );
    put("A13", "Pass rate", { font: { bold: true } });
    put(
        "B13",
        { formula: "IF(B12=0,0,B9/B12)", result: total ? countOf("Passed") / total : 0 },
        { font: { bold: true, size: 12 }, align: "center", numFmt: "0.0%" },
    );
    put("A14", "Total duration (minutes)", { font: { bold: true } });
    put(
        "B14",
        { formula: `SUM(${col("J")})`, result: rows.reduce((sum, r) => sum + r.minutes, 0) },
        { align: "center", numFmt: "0.00" },
    );

    // Per sub modul
    const groups = [];
    for (const r of rows) {
        if (!groups.some((g) => g.module === r.module && g.subModule === r.subModule)) {
            groups.push({ module: r.module, subModule: r.subModule });
        }
    }
    put("A16", "Result by Sub Modul", { font: { bold: true, size: 12, color: argb(NAVY) }, border: false });
    head("A17", "Sub Modul");
    resultLabels.forEach((label, i) => {
        head(`${"BCD"[i]}17`, label, RESULT_STYLE[label]);
    });
    head("E17", "Total");
    const subStart = 18;
    const subCats = [];
    const subSeries = resultLabels.map(() => []);
    groups.forEach((g, i) => {
        const r = subStart + i;
        const name = `${g.module} - ${g.subModule}`;
        subCats.push(name);
        put(`A${r}`, name);
        resultLabels.forEach((label, k) => {
            const value = rows.filter(
                (x) => x.module === g.module && x.subModule === g.subModule && x.result === label,
            ).length;
            subSeries[k].push(value);
            put(
                `${"BCD"[k]}${r}`,
                {
                    formula: `COUNTIFS(${col("C")},"${g.module}",${col("D")},"${g.subModule}",${col("K")},"${label}")`,
                    result: value,
                },
                { align: "center" },
            );
        });
        put(
            `E${r}`,
            { formula: `SUM(B${r}:D${r})`, result: subSeries.reduce((sum, s) => sum + s[i], 0) },
            { font: { bold: true }, align: "center" },
        );
    });
    const subEnd = subStart + groups.length - 1;

    // Per priority
    const priorities = Object.keys(PRIORITY_STYLE);
    const priLabelRow = subEnd + 2;
    const priHeadRow = priLabelRow + 1;
    const priStart = priHeadRow + 1;
    put(`A${priLabelRow}`, "Result by Priority", { font: { bold: true, size: 12, color: argb(NAVY) }, border: false });
    head(`A${priHeadRow}`, "Priority");
    resultLabels.forEach((label, i) => {
        head(`${"BCD"[i]}${priHeadRow}`, label, RESULT_STYLE[label]);
    });
    head(`E${priHeadRow}`, "Total");
    const priSeries = resultLabels.map(() => []);
    priorities.forEach((p, i) => {
        const r = priStart + i;
        put(`A${r}`, p, { font: { bold: true, color: argb(PRIORITY_STYLE[p].fg) }, fill: PRIORITY_STYLE[p].bg });
        resultLabels.forEach((label, k) => {
            const value = rows.filter((x) => x.priority === p && x.result === label).length;
            priSeries[k].push(value);
            put(
                `${"BCD"[k]}${r}`,
                { formula: `COUNTIFS(${col("F")},"${p}",${col("K")},"${label}")`, result: value },
                { align: "center" },
            );
        });
        put(
            `E${r}`,
            { formula: `SUM(B${r}:D${r})`, result: priSeries.reduce((sum, s) => sum + s[i], 0) },
            { font: { bold: true }, align: "center" },
        );
    });
    const priEnd = priStart + priorities.length - 1;

    const seriesOf = (headRow, data) =>
        resultLabels.map((label, k) => ({
            name: label,
            nameRef: `Summary!$${"BCD"[k]}$${headRow}`,
            values: data[k],
            color: RESULT_STYLE[label].bg.slice(2),
            valRef: (start, end) => `Summary!$${"BCD"[k]}$${start}:$${"BCD"[k]}$${end}`,
        }));

    return [
        {
            kind: "doughnut",
            title: "Test Result",
            anchor: { fromCol: 6, fromRow: 1, toCol: 15, toRow: 17 },
            catRef: "Summary!$A$9:$A$11",
            cats: resultLabels,
            valRef: "Summary!$B$9:$B$11",
            values: resultLabels.map(countOf),
            colors: resultLabels.map((label) => RESULT_STYLE[label].bg.slice(2)),
        },
        {
            kind: "bar",
            horizontal: true,
            title: "Result by Sub Modul",
            anchor: { fromCol: 6, fromRow: 18, toCol: 15, toRow: 18 + Math.max(18, groups.length * 2 + 6) },
            catRef: `Summary!$A$${subStart}:$A$${subEnd}`,
            cats: subCats,
            series: seriesOf(17, subSeries).map((s) => ({ ...s, valRef: s.valRef(subStart, subEnd) })),
        },
        {
            kind: "bar",
            horizontal: false,
            title: "Result by Priority",
            anchor: {
                fromCol: 6,
                fromRow: 20 + Math.max(18, groups.length * 2 + 6),
                toCol: 15,
                toRow: 38 + Math.max(18, groups.length * 2 + 6),
            },
            catRef: `Summary!$A$${priStart}:$A$${priEnd}`,
            cats: priorities,
            series: seriesOf(priHeadRow, priSeries).map((s) => ({ ...s, valRef: s.valRef(priStart, priEnd) })),
        },
    ];
}

function buildWorkbook(rows) {
    const wb = new ExcelJS.Workbook();
    const bugs = [];
    const lastRow = buildTestSheet(wb, rows, bugs);
    buildBugSheet(wb, bugs);
    const charts = buildSummarySheet(wb, rows, lastRow);
    return { wb, charts };
}

// ---------------------------------------------------------------------------
// Post-process xlsx: dropdown (data validation) dan chart.
// ExcelJS tidak punya API chart, dan data validation per-sel darinya menghasilkan range yang saling tumpang
// tindih sehingga dropdown tidak muncul. Keduanya ditulis langsung ke XML.
// ---------------------------------------------------------------------------
const esc = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const C_NS =
    'xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';

const dropdowns = (items) =>
    `<dataValidations count="${items.length}">${items
        .map(
            ({ sqref, list }) =>
                `<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" errorTitle="Nilai tidak valid" error="Pilih salah satu nilai dari dropdown." sqref="${sqref}"><formula1>"${list}"</formula1></dataValidation>`,
        )
        .join("")}</dataValidations>`;

function insertBeforeFirst(xml, tags, snippet) {
    const positions = tags.map((tag) => xml.indexOf(tag)).filter((i) => i !== -1);
    if (positions.length === 0) return xml.replace("</worksheet>", `${snippet}</worksheet>`);
    const at = Math.min(...positions);
    return xml.slice(0, at) + snippet + xml.slice(at);
}

const strCache = (values) =>
    `<c:strCache><c:ptCount val="${values.length}"/>${values.map((v, i) => `<c:pt idx="${i}"><c:v>${esc(v)}</c:v></c:pt>`).join("")}</c:strCache>`;
const numCache = (values) =>
    `<c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${values.length}"/>${values.map((v, i) => `<c:pt idx="${i}"><c:v>${v}</c:v></c:pt>`).join("")}</c:numCache>`;
const strRef = (ref, values) => `<c:strRef><c:f>${esc(ref)}</c:f>${strCache(values)}</c:strRef>`;
const numRef = (ref, values) => `<c:numRef><c:f>${esc(ref)}</c:f>${numCache(values)}</c:numRef>`;
const fillXml = (hex) => `<c:spPr><a:solidFill><a:srgbClr val="${hex}"/></a:solidFill></c:spPr>`;

const labelsXml = (color) =>
    `<c:dLbls><c:numFmt formatCode="0;;;" sourceLinked="0"/><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr><c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1000" b="1"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill></a:defRPr></a:pPr><a:endParaRPr lang="en-US"/></a:p></c:txPr><c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls>`;

const chartShell = (title, plot, legendPos) =>
    `${XML_HEAD}<c:chartSpace ${C_NS}><c:roundedCorners val="0"/><c:chart><c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1300" b="1"/></a:pPr><a:r><a:rPr lang="en-US" sz="1300" b="1"/><a:t>${esc(title)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:autoTitleDeleted val="0"/><c:plotArea><c:layout/>${plot}</c:plotArea><c:legend><c:legendPos val="${legendPos}"/><c:overlay val="0"/></c:legend><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart></c:chartSpace>`;

function doughnutXml(spec) {
    const points = spec.colors
        .map((hex, i) => `<c:dPt><c:idx val="${i}"/><c:bubble3D val="0"/>${fillXml(hex)}</c:dPt>`)
        .join("");
    const plot = `<c:doughnutChart><c:varyColors val="1"/><c:ser><c:idx val="0"/><c:order val="0"/><c:tx><c:v>${esc(spec.title)}</c:v></c:tx>${points}${labelsXml("FFFFFF")}<c:cat>${strRef(spec.catRef, spec.cats)}</c:cat><c:val>${numRef(spec.valRef, spec.values)}</c:val></c:ser><c:firstSliceAng val="0"/><c:holeSize val="55"/></c:doughnutChart>`;
    return chartShell(spec.title, plot, "r");
}

function barXml(spec) {
    const series = spec.series
        .map(
            (s, i) =>
                `<c:ser><c:idx val="${i}"/><c:order val="${i}"/><c:tx>${strRef(s.nameRef, [s.name])}</c:tx>${fillXml(s.color)}<c:invertIfNegative val="0"/>${labelsXml("FFFFFF")}<c:cat>${strRef(spec.catRef, spec.cats)}</c:cat><c:val>${numRef(s.valRef, s.values)}</c:val></c:ser>`,
        )
        .join("");
    const grid =
        '<c:majorGridlines><c:spPr><a:ln w="6350"><a:solidFill><a:srgbClr val="D9D9D9"/></a:solidFill></a:ln></c:spPr></c:majorGridlines>';
    const horizontal = spec.horizontal;
    const plot = `<c:barChart><c:barDir val="${horizontal ? "bar" : "col"}"/><c:grouping val="stacked"/><c:varyColors val="0"/>${series}<c:gapWidth val="60"/><c:overlap val="100"/><c:axId val="111111"/><c:axId val="222222"/></c:barChart><c:catAx><c:axId val="111111"/><c:scaling><c:orientation val="${horizontal ? "maxMin" : "minMax"}"/></c:scaling><c:delete val="0"/><c:axPos val="${horizontal ? "l" : "b"}"/><c:numFmt formatCode="General" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:crossAx val="222222"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/><c:noMultiLvlLbl val="0"/></c:catAx><c:valAx><c:axId val="222222"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="${horizontal ? "b" : "l"}"/>${grid}<c:numFmt formatCode="0" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:crossAx val="111111"/><c:crosses val="${horizontal ? "max" : "autoZero"}"/><c:crossBetween val="between"/></c:valAx>`;
    return chartShell(spec.title, plot, "b");
}

function drawingXml(charts) {
    const anchors = charts
        .map(
            (spec, i) =>
                `<xdr:twoCellAnchor><xdr:from><xdr:col>${spec.anchor.fromCol}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${spec.anchor.fromRow}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>${spec.anchor.toCol}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${spec.anchor.toRow}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${i + 2}" name="Chart ${i + 1}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId${i + 1}"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor>`,
        )
        .join("");
    return `${XML_HEAD}<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${anchors}</xdr:wsDr>`;
}

const REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const REL_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

async function injectParts(buffer, charts) {
    const zip = await JSZip.loadAsync(buffer);
    const edit = async (name, fn) => zip.file(name, fn(await zip.file(name).async("string")));

    // Sheet 1 = Test Case TDD, sheet 2 = Bug Report, sheet 3 = Summary (urutan addWorksheet).
    const anchorTags = ["<hyperlinks", "<printOptions", "<pageMargins"];
    await edit("xl/worksheets/sheet1.xml", (xml) =>
        insertBeforeFirst(
            xml,
            anchorTags,
            dropdowns([
                { sqref: `F3:F${MAX_ROW}`, list: Object.keys(PRIORITY_STYLE).join(",") },
                { sqref: `K3:K${MAX_ROW}`, list: Object.keys(RESULT_STYLE).join(",") },
            ]),
        ),
    );
    await edit("xl/worksheets/sheet2.xml", (xml) =>
        insertBeforeFirst(
            xml,
            anchorTags,
            dropdowns([
                { sqref: `E2:E${MAX_ROW}`, list: Object.keys(SEVERITY_STYLE).join(",") },
                { sqref: `J2:J${MAX_ROW}`, list: Object.keys(BUG_STATUS_STYLE).join(",") },
            ]),
        ),
    );

    // Chart di sheet Summary
    await edit("xl/worksheets/sheet3.xml", (xml) => xml.replace("</worksheet>", '<drawing r:id="rId1"/></worksheet>'));
    zip.file(
        "xl/worksheets/_rels/sheet3.xml.rels",
        `${XML_HEAD}<Relationships xmlns="${REL_NS}"><Relationship Id="rId1" Type="${REL_TYPE}/drawing" Target="../drawings/drawing1.xml"/></Relationships>`,
    );
    zip.file("xl/drawings/drawing1.xml", drawingXml(charts));
    zip.file(
        "xl/drawings/_rels/drawing1.xml.rels",
        `${XML_HEAD}<Relationships xmlns="${REL_NS}">${charts
            .map(
                (_, i) =>
                    `<Relationship Id="rId${i + 1}" Type="${REL_TYPE}/chart" Target="../charts/chart${i + 1}.xml"/>`,
            )
            .join("")}</Relationships>`,
    );
    charts.forEach((spec, i) => {
        zip.file(`xl/charts/chart${i + 1}.xml`, spec.kind === "doughnut" ? doughnutXml(spec) : barXml(spec));
    });

    await edit("[Content_Types].xml", (xml) =>
        xml.replace(
            "</Types>",
            `<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>${charts
                .map(
                    (_, i) =>
                        `<Override PartName="/xl/charts/chart${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`,
                )
                .join("")}</Types>`,
        ),
    );

    return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
    if (!fs.existsSync(RESULT_FILE)) {
        console.error(`Hasil tes tidak ditemukan: ${RESULT_FILE}\nJalankan dulu: npm run test:tdd`);
        process.exitCode = 1;
        return;
    }

    const report = JSON.parse(fs.readFileSync(RESULT_FILE, "utf8"));
    const rows = report.results.flatMap((suite) => collectTests(suite)).map(toRow);
    if (rows.length === 0) {
        console.error("Tidak ada test di file hasil.");
        process.exitCode = 1;
        return;
    }

    const { wb, charts } = buildWorkbook(rows);
    const buffer = await injectParts(await wb.xlsx.writeBuffer(), charts);

    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    const file = path.join(OUTPUT_DIR, `TDD-Report_${stamp}.xlsx`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(file, buffer);

    const failed = rows.filter((r) => r.result === "Failed").length;
    const unmapped = rows.filter((r) => r.module === "Unmapped").length;
    console.log(`TDD report: ${file}`);
    console.log(`Total ${rows.length} | Passed ${rows.filter((r) => r.result === "Passed").length} | Failed ${failed}`);
    if (unmapped) console.log(`Peringatan: ${unmapped} test belum didefinisikan di generate-tdd-report.js`);
}

await main();
