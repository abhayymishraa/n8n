import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../server/trpc/trpc";
import { workflowQueue } from "@repo/queue";

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const { path } = await params;
    console.log("path", path);
    const trigger = await prisma.workflowTrigger.findFirst({
      where: {
        configuration: {
          path: ["path"],
          equals: path,
        },
        workflow: {
          triggersActive: true,
        },
      },
    });
    if (!trigger) {
      return NextResponse.json(
        {
          message: "Webhook not found or maybe inactive",
        },
        { status: 404 }
      );
    }
    const latestversion = await prisma.workflowVersion.findFirst({
      where: {
        workflowId: trigger.workflowId,
      },
      orderBy: {
        version: "desc",
      },
      select: {
        id: true,
      },
    });

    if (!latestversion) {
      return NextResponse.json(
        {
          message: "Webhook not found or maybe inactive",
        },
        { status: 404 }
      );
    }

    const triggerData = await req.json();

    const execution = await prisma.execution.create({
      data: {
        workflowId: trigger.workflowId,
        workflowVersionId: latestversion?.id,
        mode: "WEBHOOK",
        status: "QUEUED",
        triggerId: trigger.id,
      },
    });

    await workflowQueue.add("workflow.execute", {
      executionId: execution.id,
      workflowVersionId: latestversion.id,
      triggerData: {
        body: triggerData,
        headers: Object.fromEntries(req.headers),
      },
    });

    return NextResponse.json({
      success: true,
      executionId: execution.id,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const { path } = await params;
    console.log("path", path);
    const trigger = await prisma.workflowTrigger.findFirst({
      where: {
        configuration: {
          path: ["path"],
          equals: path,
        },
        workflow: {
          triggersActive: true,
        },
      },
    });
    if (!trigger) {
      return NextResponse.json(
        {
          message: "Webhook not found or maybe inactive",
        },
        { status: 404 }
      );
    }
    const latestversion = await prisma.workflowVersion.findFirst({
      where: {
        workflowId: trigger.workflowId,
      },
      orderBy: {
        version: "desc",
      },
      select: {
        id: true,
      },
    });

    if (!latestversion) {
      return NextResponse.json(
        {
          message: "Webhook not found or maybe inactive",
        },
        { status: 404 }
      );
    }

    const triggerData = await req.json();

    const execution = await prisma.execution.create({
      data: {
        workflowId: trigger.workflowId,
        workflowVersionId: latestversion?.id,
        mode: "WEBHOOK",
        status: "QUEUED",
        triggerId: trigger.id,
      },
    });

    await workflowQueue.add("workflow.execute", {
      executionId: execution.id,
      workflowVersionId: latestversion.id,
      triggerData: {
        body: triggerData,
        headers: Object.fromEntries(req.headers),
      },
    });

    return NextResponse.json({
      success: true,
      executionId: execution.id,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
