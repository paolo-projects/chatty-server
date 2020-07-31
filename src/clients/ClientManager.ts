import { Client } from './Client';
import crypto from 'crypto';

export default class ClientManager {
  private clients: Map<string, Client>;

  constructor() {
    this.clients = new Map();
  }

  add(client: Client): string {
    const hash = crypto.randomBytes(16).toString('hex');
    this.clients.set(hash, client);
    return hash;
  }

  remove(hash: string) {
    this.clients.delete(hash);
  }

  getClients() {
    return Array.from(
      this.clients.entries()
    ).map(([hash, client]: [string, Client]) => ({ ...client, hash }));
  }

  count() {
    return this.clients.size;
  }
}
