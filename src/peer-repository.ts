import { Database } from "sqlite3";
import chalk from "chalk";

import { database } from "./database";
import { Peer, PeerSessionRequest, PeerUpsert } from "./types";
import { logger } from "./logger";

export class PeerRepository {
  db: Database;

  constructor() {
    this.db = database;
  }

  upsert(message: PeerUpsert) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        INSERT OR REPLACE INTO peers (
          key, discovery_key, gpu_memory, model_name, public, server_key, last_seen, online
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, TRUE)
      `,
        [
          message.key,
          message.discoveryKey,
          message.config.gpuMemory,
          message.config.modelName,
          message.config.public,
          message.config.serverKey,
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  getByDiscoveryKey(discoveryKey: string): Promise<Peer> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM peers WHERE discovery_key = ?",
        [discoveryKey],
        (err, row: Peer) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  getPeer(randomPeerRequest: PeerSessionRequest): Promise<Peer> {
    return new Promise((resolve, reject) => {
      const { modelName } = randomPeerRequest;
      this.db.get(
        `SELECT * FROM peers WHERE model_name = ? ORDER BY RANDOM() LIMIT 1`,
        [modelName],
        (err, row: Peer) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  updateLastSeen(peerKey: string) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE peers SET last_seen = ?, online = FALSE WHERE key = ?",
        [new Date().toISOString(), peerKey],
        function (err) {
          if (err) {
            console.error(
              chalk.red("❌ Error updating peer last seen in database:"),
              err
            );
            reject(err);
          } else {
            if (this.changes > 0) {
              logger.info(
                chalk.yellow("🕒 Peer disconnected"),
              );
            } else {
              logger.info(
                chalk.yellow("⚠️ Peer not found in database"),
              );
            }
            resolve(this.changes);
          }
        }
      );
    });
  }

  async getActivePeerCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT COUNT(*) as count FROM peers WHERE online = TRUE",
        (err, row: { count: number }) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count);
          }
        }
      );
    });
  }

  async getActiveModelCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT COUNT(DISTINCT model_name) as count FROM peers WHERE online = TRUE",
        (err, row: { count: number }) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count);
          }
        }
      );
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStats(peerKey: string, data: any) {
    // TODO: Update stats in database
    logger.info(peerKey, data);
  }
}

module.exports = {
  PeerRepository,
};
