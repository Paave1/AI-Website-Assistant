import {Signals} from './analyzer';

export function computeScore(signals: Signals): number {
  let score = 0;
  // meta completeness (20)
  let meta = 0;
  if (signals.title) meta += 7;
  if (signals.metaDescription) meta += 7;
  if (signals.h1) meta += 6;
  score += Math.min(meta, 20);

  // mobile check (20)
  score += signals.hasViewportMeta ? 20 : 0;

  // https (20)
  score += signals.hasHTTPS ? 20 : 0;

  // speed heuristic (20): fewer scripts, smaller images
  let speed = 20;
  if (signals.scriptCount > 20) speed -= 10;
  else if (signals.scriptCount > 10) speed -= 5;
  if ((signals.avgImgBytesApprox || 0) > 500_000) speed -= 10;
  else if ((signals.avgImgBytesApprox || 0) > 200_000) speed -= 5;
  speed = Math.max(0, Math.min(20, speed));
  score += speed;

  // GDPR hints (20)
  const gdpr = (signals.hasCookieWords ? 10 : 0) + (signals.privacyPolicyUrlFound ? 10 : 0);
  score += gdpr;

  return Math.max(0, Math.min(100, Math.round(score)));
}



