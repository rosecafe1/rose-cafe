// Server-Sent Events manager for realtime admin updates
// Keeps track of connected admin clients and broadcasts events

type SSEClient = {
    id: string;
    controller: ReadableStreamDefaultController;
};

class EventManager {
    private clients: SSEClient[] = [];

    addClient(controller: ReadableStreamDefaultController): string {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        this.clients.push({ id, controller });
        console.log(`[SSE] Client connected: ${id} (total: ${this.clients.length})`);
        return id;
    }

    removeClient(id: string) {
        this.clients = this.clients.filter((c) => c.id !== id);
        console.log(`[SSE] Client disconnected: ${id} (total: ${this.clients.length})`);
    }

    broadcast(event: string, data: any) {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        const encoder = new TextEncoder();
        const encoded = encoder.encode(message);

        this.clients.forEach((client) => {
            try {
                client.controller.enqueue(encoded);
            } catch {
                // Client disconnected, will be cleaned up
                this.removeClient(client.id);
            }
        });
    }
}

// Singleton
const globalForEvents = globalThis as unknown as {
    eventManager: EventManager | undefined;
};

export const eventManager =
    globalForEvents.eventManager ?? new EventManager();

if (process.env.NODE_ENV !== "production") {
    globalForEvents.eventManager = eventManager;
}
