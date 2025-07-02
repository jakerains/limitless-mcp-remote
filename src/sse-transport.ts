import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';

export class SSETransport implements Transport {
  private controller?: ReadableStreamDefaultController<Uint8Array>;
  private encoder = new TextEncoder();

  start(controller: ReadableStreamDefaultController<Uint8Array>): void {
    this.controller = controller;
  }

  async send(message: JSONRPCMessage): Promise<void> {
    if (!this.controller) {
      throw new Error('Transport not started');
    }

    const messageStr = JSON.stringify(message);
    const data = this.encoder.encode(`data: ${messageStr}\n\n`);
    this.controller.enqueue(data);
  }

  close(): void {
    if (this.controller) {
      this.controller.close();
    }
  }
}