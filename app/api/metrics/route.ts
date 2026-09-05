/**
 * API Route: Prometheus Metrics Endpoint
 * Expone métricas en formato Prometheus en /api/metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { formatPrometheusMetrics } from '@/lib/metrics';

export async function GET(req: NextRequest) {
  const expectedToken = process.env.METRICS_TOKEN
  const authHeader = req.headers.get('authorization')
  const providedToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!expectedToken || providedToken !== expectedToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const metrics = formatPrometheusMetrics();

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}
