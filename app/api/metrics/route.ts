/**
 * API Route: Prometheus Metrics Endpoint
 * Expone métricas en formato Prometheus en /api/metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { formatPrometheusMetrics } from '@/lib/metrics';

export async function GET(req: NextRequest) {
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
