import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../server/trpc/trpc";
import { workflowQueue } from "../../../../server/trpc/routers/workflow";

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const { path } = await params;
    console.log("POST path:", path);

    try {
      const allWorkflows = await prisma.workflow.findMany({
        select: {
          id: true,
          name: true,
          triggersActive: true,
        },
      });
      console.log("All workflows:", JSON.stringify(allWorkflows, null, 2));

      const allTriggers = await prisma.workflowTrigger.findMany({
        include: {
          workflow: true,
        },
      });
      console.log("All triggers:", JSON.stringify(allTriggers, null, 2));
    } catch (debugError) {
      console.error("Debug query error:", debugError);
    }

    let foundTrigger = null;
    try {
      const allTriggers = await prisma.workflowTrigger.findMany({
        include: {
          workflow: true,
        },
      });

      console.log("Total triggers found:", allTriggers.length);

      foundTrigger = allTriggers.find((trigger) => {
        const config = trigger.configuration as any;
        console.log("Checking trigger config:", config, "against path:", path);
        return (
          config?.path === path && trigger.workflow?.triggersActive === true
        );
      });

      console.log("Found trigger via JS filter:", foundTrigger);
    } catch (filterError) {
      console.error("Filter error:", filterError);
    }

    if (!foundTrigger) {
      return NextResponse.json(
        {
          message: "Webhook not found or maybe inactive",
          debug: {
            searchedPath: path,
            message:
              "No matching trigger found with this path and active workflow",
          },
        },
        { status: 404 }
      );
    }
    const latestversion = await prisma.workflowVersion.findFirst({
      where: {
        workflowId: foundTrigger.workflowId,
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
        workflowId: foundTrigger.workflowId,
        workflowVersionId: latestversion?.id,
        mode: "WEBHOOK",
        status: "QUEUED",
        triggerId: foundTrigger.id,
      },
    });

    await workflowQueue.add("workflow-execution", {
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
    console.log("GET path", path);

    // Simple approach - get all triggers and filter in JavaScript (no raw SQL)
    let trigger = null;
    try {
      const allTriggers = await prisma.workflowTrigger.findMany({
        include: {
          workflow: true,
        },
      });

      trigger = allTriggers.find((t) => {
        const config = t.configuration as any;
        return config?.path === path && t.workflow?.triggersActive === true;
      });

      console.log("GET - Found trigger:", trigger);
    } catch (error) {
      console.error("GET - Error finding trigger:", error);
    }

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

    // GET requests typically don't have a body, use query parameters or headers instead
    const triggerData = {
      method: "GET",
      query: Object.fromEntries(new URL(req.url).searchParams),
      headers: Object.fromEntries(req.headers),
    };

    const execution = await prisma.execution.create({
      data: {
        workflowId: trigger.workflowId,
        workflowVersionId: latestversion?.id,
        mode: "WEBHOOK",
        status: "QUEUED",
        triggerId: trigger.id,
      },
    });

    await workflowQueue.add("workflow-execution", {
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
