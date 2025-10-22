import type { Request, Response } from "express";
import { Controller, Get, Middleware } from "@plane/decorators";
import { serverAgentManager } from "@/agents/server-agent";
import { env } from "@/env";
// Import authentication middleware
import { requireSecretKey } from "@/lib/auth-middleware";

@Controller("/health")
export class HealthController {
  @Get("/")
  async healthCheck(_req: Request, res: Response) {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      version: env.APP_VERSION,
    });
  }

  @Get("/memory")
  @Middleware(requireSecretKey)
  async memoryHealth(req: Request, res: Response) {
    const memUsage = process.memoryUsage();
    const metrics = serverAgentManager.getMetrics();
    const stats = serverAgentManager.getStats();

    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapPercent: `${Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)}%`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        arrayBuffers: `${Math.round(memUsage.arrayBuffers / 1024 / 1024)}MB`,
      },
      serverAgent: {
        connections: metrics.connections,
        recentActivity: stats.connections.slice(0, 10), // Show last 10 connections
      },
      hocuspocus: metrics.hocuspocus,
      uptime: `${Math.round(process.uptime())}s`,
    });
  }
}
