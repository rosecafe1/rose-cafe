import { eventManager } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET() {
    let clientId: string;

    const stream = new ReadableStream({
        start(controller) {
            clientId = eventManager.addClient(controller);

            // Send initial heartbeat
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
        },
        cancel() {
            eventManager.removeClient(clientId);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}
