import { PDFDocument, StandardFonts } from "pdf-lib";
import * as XLSX from "xlsx";

export type ExportFormat = "csv" | "xlsx" | "pdf";

function escapeCsvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function csv(rows: string[][]) {
  return `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n")}\r\n`;
}

function wrapText(text: string, maxLength: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (line && `${line} ${word}`.length > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

async function pdf(rows: string[][]) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 42;
  const lineHeight = 11;
  let page = document.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const addPage = () => {
    page = document.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
    page.drawText(rows[0]?.join("  |  ") ?? "Export", {
      x: margin,
      y,
      size: 8,
      font: boldFont,
      maxWidth: pageWidth - margin * 2,
    });
    y -= lineHeight * 2;
  };

  if (rows[0]) {
    page.drawText(rows[0].join("  |  "), {
      x: margin,
      y,
      size: 8,
      font: boldFont,
      maxWidth: pageWidth - margin * 2,
    });
    y -= lineHeight * 2;
  }

  for (const row of rows.slice(1)) {
    const line = row.map((value) => value.replace(/\s+/g, " ")).join("  |  ");
    const wrapped = wrapText(line, 112);
    if (y - wrapped.length * lineHeight < margin) addPage();
    for (const part of wrapped) {
      page.drawText(part, { x: margin, y, size: 7, font, maxWidth: pageWidth - margin * 2 });
      y -= lineHeight;
    }
    y -= 3;
  }

  return document.save();
}

export async function createAdminExport(rows: string[][], baseName: string, format: ExportFormat) {
  const date = new Date().toISOString().slice(0, 10);
  let body: BodyInit;
  let contentType: string;
  if (format === "xlsx") {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Export");
    body = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  } else if (format === "pdf") {
    const bytes = await pdf(rows);
    const downloadBytes = new Uint8Array(bytes.length);
    downloadBytes.set(bytes);
    body = downloadBytes.buffer;
    contentType = "application/pdf";
  } else {
    body = csv(rows);
    contentType = "text/csv; charset=utf-8";
  }

  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${baseName}-${date}.${format}"`,
      "Cache-Control": "no-store",
    },
  });
}

export function parseExportFormat(value: string | null): ExportFormat {
  return value === "xlsx" || value === "pdf" ? value : "csv";
}
