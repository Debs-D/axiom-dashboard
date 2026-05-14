import { NextRequest } from 'next/server';
import {
  generateTick,
  generateFraudSignal,
  generateGatewayHealth,
  generateLatencyMatrix,
  generateAlert,
  generateKPI,
} from '@/lib/generators/paymentDataGenerator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const enqueue = (data: object) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // Bootstrap with initial state immediately
      enqueue(generateKPI());
      enqueue(generateGatewayHealth());
      enqueue(generateLatencyMatrix());

      // TICK + fraud signal — 100ms
      const tickTimer = setInterval(() => {
        enqueue(generateTick());
        if (Math.random() < 0.7) enqueue(generateFraudSignal());
      }, 100);

      // KPI snapshot — 1s
      const kpiTimer = setInterval(() => enqueue(generateKPI()), 1000);

      // Gateway health — 2s
      const gwTimer = setInterval(() => enqueue(generateGatewayHealth()), 2000);

      // Latency matrix — 5s
      const latTimer = setInterval(() => enqueue(generateLatencyMatrix()), 5000);

      // Alerts — Poisson mean ~4s (check every 500ms with p=0.125)
      const alertTimer = setInterval(() => {
        if (Math.random() < 0.125) enqueue(generateAlert());
      }, 500);

      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(tickTimer);
        clearInterval(kpiTimer);
        clearInterval(gwTimer);
        clearInterval(latTimer);
        clearInterval(alertTimer);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
