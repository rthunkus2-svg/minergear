import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs";
import path from "path";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "subscribers.json");

function loadSubscribers(): string[] {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function saveSubscribers(list: string[]) {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2));
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Email subscription endpoint
  app.post("/api/subscribe", (req, res) => {
    const email = (req.query.email as string || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }
    const subs = loadSubscribers();
    if (!subs.includes(email)) {
      subs.push(email);
      saveSubscribers(subs);
    }
    res.json({ success: true, message: "Subscribed" });
  });

  app.get("/api/subscribers", (_req, res) => {
    const subs = loadSubscribers();
    res.json({ count: subs.length, emails: subs });
  });

  return httpServer;
}
