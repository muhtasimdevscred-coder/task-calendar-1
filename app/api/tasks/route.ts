import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDateRange, FilterType } from "@/lib/dates";

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

    return NextResponse.json(tasks);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, task, postType } = body;

    if (!date || !task || !postType) {
      return NextResponse.json(
        { error: "date, task, and postType are required" },
        { status: 400 }
      );
    }

    const created = await prisma.task.create({
      data: {
        date: new Date(date),
        task: String(task).trim(),
        postType: String(postType).trim(),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
