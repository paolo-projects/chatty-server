import { Client } from './Client';
import crypto from 'crypto';

export default class ClientManager {
  clients: Map<string, Client>;

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
}
