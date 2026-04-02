import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: {
    runId: string;
  };
};

export async function GET(req: NextRequest, context: Context) {
  try {
    const { userId } = await auth();

    // 🔐 Unauthorized check
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { runId } = context.params;

    // 🔍 Fetch workflow run
    const run = await prisma.workflowRun.findUnique({
      where: { id: runId },
      include: {
        nodeRuns: {
          orderBy: { startedAt: "asc" },
        },
      },
    });

    // ❌ Not found or not owned by user
    if (!run || run.userId !== userId) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    // ✅ Success
    return NextResponse.json(run);
  } catch (error) {
    console.error("GET /api/history/[runId] error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}