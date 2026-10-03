export function sma(values, period) {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a,b)=>a+b,0)/period;
}

export function ema(values, period) {
  if (values.length < period) return null;
  const k = 2/(period+1);
  let e = values.slice(0, period).reduce((a,b)=>a+b,0)/period;
  for (let i=period;i<values.length;i++) e = values[i]*k + e*(1-k);
  return e;
}

export function rsi(closes, period=14) {
  if (closes.length <= period) return null;
  let gains=0, losses=0;
  for(let i=1;i<=period;i++){ const d=closes[i]-closes[i-1]; gains += Math.max(d,0); losses += Math.max(-d,0); }
  let avgGain=gains/period, avgLoss=losses/period;
  for(let i=period+1;i<closes.length;i++){
    const d=closes[i]-closes[i-1];
    avgGain=(avgGain*(period-1)+Math.max(d,0))/period;
    avgLoss=(avgLoss*(period-1)+Math.max(-d,0))/period;
  }
  if(avgLoss===0) return 100;
  return 100-(100/(1+avgGain/avgLoss));
}

export function analyzeCandles(candles){
  const closes=candles.map(c=>c.close);
  const e20=ema(closes,20), e50=ema(closes,50), rv=rsi(closes,14);
  if(e20==null || e50==null || rv==null) return {direction:'WAIT',score:0,reasons:['Need at least 50 candles'],indicators:{ema20:e20,ema50:e50,rsi:rv}};
  let call=0, put=0; const reasons=[];
  if(e20>e50){call+=30; reasons.push('EMA20 above EMA50');} else {put+=30; reasons.push('EMA20 below EMA50');}
  if(rv>55 && rv<70){call+=25; reasons.push('RSI bullish zone');}
  if(rv<45 && rv>30){put+=25; reasons.push('RSI bearish zone');}
  if(rv>=70){put+=10; reasons.push('RSI overbought caution');}
  if(rv<=30){call+=10; reasons.push('RSI oversold caution');}
  const recent=closes.slice(-5); const momentum=recent.at(-1)-recent[0];
  if(momentum>0){call+=20; reasons.push('Positive short-term momentum');} else if(momentum<0){put+=20; reasons.push('Negative short-term momentum');}
  const last=candles.at(-1);
  const range=last.high-last.low;
  if(range>0 && Math.abs(last.close-last.open)/range>0.55){
    if(last.close>last.open){call+=15; reasons.push('Strong bullish candle');}
    else {put+=15; reasons.push('Strong bearish candle');}
  }
  const direction=call>put?'CALL':put>call?'PUT':'WAIT';
  const score=Math.min(95,Math.max(call,put));
  return {direction,score,reasons,indicators:{ema20:e20,ema50:e50,rsi:rv}};
}

export function evaluateSignal(signal, expiryClose){
  if(signal.direction==='WAIT') return 'NO_SIGNAL';
  if(expiryClose===signal.entryPrice) return 'DRAW';
  const won=signal.direction==='CALL' ? expiryClose>signal.entryPrice : expiryClose<signal.entryPrice;
  return won?'WIN':'LOSS';
}
