import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getDateRange, FilterType } from "@/lib/dates";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") as FilterType) || "all";
    const refDateStr = searchParams.get("refDate");
    const refDate = refDateStr ? new Date(refDateStr) : new Date();

    const { from, to } = getDateRange(filter, refDate);

    const tasks = await prisma.task.findMany({
      where: from && to ? { date: { gte: from, lte: to } } : {},
      orderBy: { date: "asc" },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Task Calendar";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Tasks", {
      properties: { defaultRowHeight: 22 },
      views: [{ state: "frozen", ySplit: 1 }],
    });

    // Columns
    sheet.columns = [
      { header: "Date", key: "date", width: 28 },
      { header: "Task", key: "task", width: 60 },
      { header: "Post Type", key: "postType", width: 22 },
    ];

    // Header styling
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    headerRow.alignment = { vertical: "middle", horizontal: "left" };
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F2937" }, // slate-800
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FF111827" } },
        left: { style: "thin", color: { argb: "FF111827" } },
        bottom: { style: "thin", color: { argb: "FF111827" } },
        right: { style: "thin", color: { argb: "FF111827" } },
      };
    });

    // Data rows
    tasks.forEach((t: { date: Date | string; task: string; postType: string }, idx: number) => {
      const row = sheet.addRow({
        date: format(new Date(t.date), "EEE, MMM d, yyyy"),
        task: t.task,
        postType: t.postType,
      });

      const isEven = idx % 2 === 0;
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        };
        cell.font = { size: 11, color: { argb: "FF111827" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: isEven ? "FFF9FAFB" : "FFFFFFFF" }, // alt rows
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        };
      });
    });

    // Auto filter on header
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 3 },
    };

    const buffer = await workbook.xlsx.writeBuffer();

    const filename = `tasks-${filter}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to export tasks" },
      { status: 500 }
    );
  }
}
