export class SSETransport {
    controller;
    encoder = new TextEncoder();
    start(controller) {
        this.controller = controller;
    }
    async send(message) {
        if (!this.controller) {
            throw new Error('Transport not started');
        }
        const messageStr = JSON.stringify(message);
        const data = this.encoder.encode(`data: ${messageStr}\n\n`);
        this.controller.enqueue(data);
    }
    close() {
        if (this.controller) {
            this.controller.close();
        }
    }
}
