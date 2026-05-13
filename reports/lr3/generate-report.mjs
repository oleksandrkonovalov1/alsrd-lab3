#!/usr/bin/env node

/**
 * DOCX report generator for Lab 3 — Algorithms & Data Structures
 * Topic: Algorithms on binary trees
 *
 * Formatting: ДСТУ 3008:2015 compact lab style
 * - Key fragments only in body (section 3), full code in ДОДАТОК А
 * - Real program output via execSync
 * - Grey background + blue left accent for code blocks
 * - keepNext on all headings and captions
 * - pageBreakBefore on sections 4, 5, ДОДАТОК А
 * - Short code blocks (<=25 lines) keepTogether, long blocks flow naturally
 *
 * Usage: npm run report
 */

import {
  Document, Packer, Paragraph, TextRun, Header,
  AlignmentType, PageNumber, HeadingLevel,
  PageBreak, BorderStyle, ShadingType,
} from "docx";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { execSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Constants (ДСТУ 3008:2015) ─────────────────────────────────────

const MM_TO_DXA = 56.693;
const PT_TO_HALF_PT = 2;

const FONT = "Times New Roman";
const FONT_CODE = "Courier New";
const BODY_SIZE = 14 * PT_TO_HALF_PT;
const CODE_SIZE = 9 * PT_TO_HALF_PT;
const TITLE_SIZE = 14 * PT_TO_HALF_PT;
const LINE_SPACING_15 = 360;
const FIRST_LINE_INDENT = Math.round(12.5 * MM_TO_DXA);
const CODE_LEFT_INDENT = 283;
const CODE_BORDER_COLOR = "4472C4";
const CODE_BG_COLOR = "F2F2F2";

const margins = {
  top: Math.round(20 * MM_TO_DXA),
  bottom: Math.round(20 * MM_TO_DXA),
  left: Math.round(30 * MM_TO_DXA),
  right: Math.round(15 * MM_TO_DXA),
};

// ─── Helpers ────────────────────────────────────────────────────────

function titleRun(text, opts = {}) {
  return new TextRun({
    text,
    font: FONT,
    size: TITLE_SIZE,
    bold: opts.bold ?? false,
    ...opts,
  });
}

function bodyRun(text, opts = {}) {
  return new TextRun({ text, font: FONT, size: BODY_SIZE, ...opts });
}

function centeredParagraph(runs, spacing = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 0, line: LINE_SPACING_15, lineRule: "auto", ...spacing },
    children: Array.isArray(runs) ? runs : [runs],
  });
}

function emptyLine() {
  return centeredParagraph(titleRun(""));
}

function sectionHeading(number, title, { pageBreakBefore: pbBefore = false } = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120, line: LINE_SPACING_15, lineRule: "auto" },
    keepNext: true,
    pageBreakBefore: pbBefore,
    children: [
      new TextRun({
        text: [number, title].filter(Boolean).join(" ").toUpperCase(),
        font: FONT,
        size: BODY_SIZE,
        bold: true,
      }),
    ],
  });
}

function subsectionHeading(number, title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 120, after: 60, line: LINE_SPACING_15, lineRule: "auto" },
    indent: { firstLine: FIRST_LINE_INDENT },
    keepNext: true,
    children: [
      new TextRun({
        text: `${number} ${title}`,
        font: FONT,
        size: BODY_SIZE,
        bold: true,
      }),
    ],
  });
}

function bodyParagraph(text) {
  return new Paragraph({
    spacing: { after: 0, line: LINE_SPACING_15, lineRule: "auto" },
    indent: { firstLine: FIRST_LINE_INDENT },
    alignment: AlignmentType.JUSTIFIED,
    children: [bodyRun(text)],
  });
}

function codeParagraph(text, { keepLines = false, keepNext = false } = {}) {
  return new Paragraph({
    spacing: { after: 0, line: 240, lineRule: "auto" },
    indent: { left: CODE_LEFT_INDENT },
    shading: { fill: CODE_BG_COLOR, color: "auto", type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: CODE_BORDER_COLOR, space: 4 } },
    keepLines,
    keepNext,
    children: [
      new TextRun({ text: text || " ", font: FONT_CODE, size: CODE_SIZE, shading: { fill: CODE_BG_COLOR, color: "auto", type: ShadingType.CLEAR } }),
    ],
  });
}

function listingCaption(number, title) {
  return new Paragraph({
    spacing: { before: 120, after: 60, line: LINE_SPACING_15, lineRule: "auto" },
    indent: { firstLine: FIRST_LINE_INDENT },
    keepNext: true,
    children: [bodyRun(`Лістинг ${number} — ${title}`)],
  });
}

function codeBlock(text) {
  const lines = text.split("\n");
  const keepTogether = lines.length <= 25;
  return lines.map((line, i) => codeParagraph(line, {
    keepLines: keepTogether,
    keepNext: keepTogether && i < lines.length - 1,
  }));
}

// ─── Source code reader ─────────────────────────────────────────────

function readSourceFiles() {
  const srcDir = join(__dirname, "..", "..", "src");
  const files = [];
  function walk(dir, prefix = "") {
    const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (entry.name.endsWith(".ts")) {
        files.push({
          name: prefix ? `${prefix}/${entry.name}` : entry.name,
          content: readFileSync(fullPath, "utf-8"),
        });
      }
    }
  }
  walk(srcDir);
  return files;
}

// ─── Real program output ────────────────────────────────────────────

const repoRoot = join(__dirname, "..", "..");
// Safe: hardcoded command, no user input
const programOutput = execSync("npx tsx src/main.ts", { cwd: repoRoot, encoding: "utf-8" }).trim();

// ─── Key fragments for body ─────────────────────────────────────────

const insertFragment = `  insert(key: number): void {
    this.root = this.insertNode(this.root, key);
  }

  private insertNode(node: TreeNode | null, key: number): TreeNode {
    if (!node) return new TreeNode(key);
    if (key < node.key) {
      node.left = this.insertNode(node.left, key);
    } else if (key > node.key) {
      node.right = this.insertNode(node.right, key);
    }
    return node;
  }`;

const searchFragment = `  search(key: number): TreeNode | null {
    return this.searchNode(this.root, key);
  }

  private searchNode(node: TreeNode | null, key: number): TreeNode | null {
    if (!node || node.key === key) return node;
    if (key < node.key) return this.searchNode(node.left, key);
    return this.searchNode(node.right, key);
  }`;

const inOrderFragment = `  private inOrderTraversal(node: TreeNode | null, keys: number[]): void {
    if (!node) return;
    this.inOrderTraversal(node.left, keys);
    keys.push(node.key);
    this.inOrderTraversal(node.right, keys);
  }`;

// ─── TITLE PAGE ─────────────────────────────────────────────────────

const titlePageParagraphs = [
  centeredParagraph(titleRun("Міністерство освіти і науки України")),
  centeredParagraph(titleRun("Харківський національний університет радіоелектроніки")),
  emptyLine(),
  centeredParagraph(titleRun("Кафедра програмної інженерії")),
  emptyLine(), emptyLine(), emptyLine(), emptyLine(),
  centeredParagraph(titleRun("ЗВІТ", { bold: true })),
  centeredParagraph(titleRun("з лабораторної роботи № 3")),
  centeredParagraph(titleRun("з дисципліни «Алгоритми та структури даних»")),
  centeredParagraph(titleRun("на тему: «Складання алгоритмів на бінарних деревах»")),
  emptyLine(), emptyLine(),
  centeredParagraph(titleRun("Варіант 9")),
  emptyLine(),
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 0, line: LINE_SPACING_15, lineRule: "auto" },
    children: [titleRun("Виконав: ст. гр. ПЗПІ-25-6")],
  }),
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 0, line: LINE_SPACING_15, lineRule: "auto" },
    children: [titleRun("Коновалов О. О.")],
  }),
  emptyLine(),
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 0, line: LINE_SPACING_15, lineRule: "auto" },
    children: [titleRun("Перевірив: Олійник О. О.")],
  }),
  emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
  centeredParagraph(titleRun("Харків — 2026")),
];

// ─── BODY ───────────────────────────────────────────────────────────

const bodyParagraphs = [
  // Body starts on new page (after title)
  new Paragraph({ children: [new PageBreak()] }),

  // Sections 1-3 flow together
  sectionHeading("1", "Мета роботи"),
  bodyParagraph("Навчитися складати алгоритми роботи з динамічними множинами, представленими бінарними деревами."),

  sectionHeading("2", "Завдання"),
  bodyParagraph("Реалізувати двійкове дерево пошуку з наступними функціями: додавання нових ключів до дерева, роздрукування всіх ключів дерева (in-order обхід), пошук ключів у дереві."),

  sectionHeading("3", "Хід роботи"),

  subsectionHeading("3.1", "Двійкове дерево пошуку"),
  bodyParagraph("Двійковим деревом пошуку називається дерево, у якому з кожною вершиною пов’язане значення ключа. Ключі зберігаються з дотриманням властивості впорядкованості: якщо y знаходиться в лівому піддереві вершини x, то y→key < x→key; інакше y→key > x→key. Кожен вузол зберігає поля left, right (покажчики на дітей) та key."),
  listingCaption("3.1", "Додавання ключа до дерева"),
  ...codeBlock(insertFragment),

  subsectionHeading("3.2", "Пошук у дереві"),
  bodyParagraph("Пошук починається з кореня. Якщо поточний вузол null — ключ не знайдено. Якщо ключ збігається — вузол знайдено. Якщо ключ менший — рекурсивно шукаємо в лівому піддереві, інакше — в правому."),
  listingCaption("3.2", "Пошук ключа у дереві"),
  ...codeBlock(searchFragment),

  subsectionHeading("3.3", "Обхід дерева (in-order)"),
  bodyParagraph("In-order обхід двійкового дерева пошуку виводить ключі у відсортованому порядку: спочатку обходиться ліве піддерево, потім поточний вузол, потім праве піддерево."),
  listingCaption("3.3", "In-order обхід"),
  ...codeBlock(inOrderFragment),

  // Section 4 — new page
  sectionHeading("4", "Результати", { pageBreakBefore: true }),
  bodyParagraph("Результати виконання програми наведено нижче."),
  listingCaption("4.1", "Вивід програми"),
  ...codeBlock(programOutput),

  // Section 5 — new page
  sectionHeading("5", "Висновки", { pageBreakBefore: true }),
  bodyParagraph("У ході лабораторної роботи було реалізовано двійкове дерево пошуку з операціями додавання, пошуку та in-order обходу. In-order обхід виводить ключі у відсортованому порядку, що підтверджує коректність властивості впорядкованості BST. Пошук працює коректно: існуючі ключі знаходяться, відсутні — повертають null."),
];

// ─── ДОДАТОК А ──────────────────────────────────────────────────────

const appendixParagraphs = [
  sectionHeading("", "Додаток А", { pageBreakBefore: true }),
  centeredParagraph(bodyRun("Вихідний код програми", { bold: true })),
  emptyLine(),
];

const sourceFiles = readSourceFiles();
let listingCounter = 1;
for (const file of sourceFiles) {
  const num = `А.${listingCounter}`;
  appendixParagraphs.push(listingCaption(num, file.name));
  appendixParagraphs.push(...codeBlock(file.content.trimEnd()));
  appendixParagraphs.push(emptyLine());
  listingCounter++;
}

// ─── DOCUMENT ───────────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: BODY_SIZE, language: { value: "uk-UA" } },
        paragraph: { spacing: { after: 0, line: LINE_SPACING_15, lineRule: "auto" } },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: BODY_SIZE, bold: true, font: FONT },
        paragraph: { spacing: { before: 240, after: 120, line: LINE_SPACING_15, lineRule: "auto" }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: BODY_SIZE, bold: true, font: FONT },
        paragraph: { spacing: { before: 120, after: 60, line: LINE_SPACING_15, lineRule: "auto" }, outlineLevel: 1 },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { ...margins, header: 708, footer: 708 },
      },
      titlePage: true,
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: BODY_SIZE })],
        })],
      }),
    },
    children: [...titlePageParagraphs, ...bodyParagraphs, ...appendixParagraphs],
  }],
});

const outputPath = join(__dirname, "Звіт_ЛР3_Коновалов_ПЗПІ-25-6.docx");
const buffer = await Packer.toBuffer(doc);
writeFileSync(outputPath, buffer);
console.log(`Created: ${outputPath}`);
