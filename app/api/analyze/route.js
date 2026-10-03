import { analyzeCandles } from '../../../lib/signal-engine';

export async function POST(request) {
  try {
    const body = await request.json();
    const candles = Array.isArray(body?.candles) ? body.candles : [];
    if (candles.length < 50) {
      return Response.json({error:'At least 50 candles are required for the V1 engine.'},{status:400});
    }
    const clean = candles.map(c=>({open:Number(c.open),high:Number(c.high),low:Number(c.low),close:Number(c.close)}));
    if (clean.some(c=>Object.values(c).some(v=>!Number.isFinite(v)))) {
      return Response.json({error:'Candle data contains invalid numbers.'},{status:400});
    }
    return Response.json({mode:'PAPER', ...analyzeCandles(clean), timestamp:new Date().toISOString()});
  } catch {
    return Response.json({error:'Invalid JSON payload.'},{status:400});
  }
}
