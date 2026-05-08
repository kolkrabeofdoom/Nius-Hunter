import { GraphData, GraphNode } from '../services/bsky';

export interface ForensicsResults {
  coordinatedNodeIds: string[];
  sockpuppetGroups: string[][];
  topLinks: { url: string; count: number }[];
  avgToxicity: number;
  botDensity: number;
  totalReach: number;
  networkDensity: number;
  avgSuspectScore: number;
  burstClusters: { time: string; count: number }[];
  fingerprintClusters: { domain: string; nodeIds: string[] }[];
  batchCreationGroups: { date: string; nodeIds: string[] }[];
}

export function runForensics(data: GraphData): ForensicsResults {
  const coordinatedNodes = new Set<string>();
  const sockpuppetGroups: string[][] = [];
  const linkCounts: Record<string, number> = {};

  // 1. Synchronicity Detector
  // Group nodes by their repost timestamps (rounded to 2 minutes for more robustness)
  const timeBuckets: Record<string, string[]> = {};
  data.nodes.forEach(node => {
    if (node.repostTimes && node.repostTimes.length > 0) {
      node.repostTimes.forEach(time => {
        const date = new Date(time);
        // Round to nearest 2 minutes
        const bucket = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${Math.floor(date.getMinutes() / 2) * 2}`;
        if (!timeBuckets[bucket]) timeBuckets[bucket] = [];
        timeBuckets[bucket].push(node.id);
      });
    }
  });

  // If a bucket has > 3 nodes, mark them as coordinated
  Object.values(timeBuckets).forEach(ids => {
    if (ids.length > 3) {
      ids.forEach(id => coordinatedNodes.add(id));
    }
  });

  // 2. Source Mapping
  data.nodes.forEach(node => {
    if (node.links) {
      node.links.forEach(link => {
        try {
          const domain = new URL(link).hostname;
          linkCounts[domain] = (linkCounts[domain] || 0) + 1;
        } catch (e) {
          linkCounts[link] = (linkCounts[link] || 0) + 1;
        }
      });
    }
  });

  const sortedLinks = Object.entries(linkCounts)
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 3. Sockpuppet Detection (Masken-Check)
  const processedNodes = data.nodes.filter(n => !n.isRoot && n.description);
  for (let i = 0; i < processedNodes.length; i++) {
    const group = [processedNodes[i].id];
    for (let j = i + 1; j < processedNodes.length; j++) {
      const sim = calculateSimilarity(processedNodes[i].description!, processedNodes[j].description!);
      if (sim > 0.85) { // Stricter for groups
        group.push(processedNodes[j].id);
      }
    }
    if (group.length > 2) { // Only clusters of 3+
      sockpuppetGroups.push(group);
    }
  }

  // 4. Advanced Metrics
  const toxicNodes = data.nodes.filter(n => n.toxicity !== undefined);
  const avgToxicity = toxicNodes.length > 0 
    ? toxicNodes.reduce((acc, n) => acc + (n.toxicity || 0), 0) / toxicNodes.length 
    : 0;

  // 4. Metadata & Environment Fingerprinting (Method 4)
  // 4.1 Domain Fingerprinting
  const domainToNodes: Record<string, string[]> = {};
  data.nodes.forEach(node => {
    if (node.links) {
      node.links.forEach(link => {
        try {
          const domain = new URL(link).hostname;
          if (!domainToNodes[domain]) domainToNodes[domain] = [];
          domainToNodes[domain].push(node.id);
        } catch (e) {
          // Skip invalid URLs
        }
      });
    }
  });

  const fingerprintClusters = Object.entries(domainToNodes)
    .filter(([_, ids]) => ids.length > 2) // At least 3 nodes sharing a domain
    .map(([domain, nodeIds]) => ({ domain, nodeIds }));

  // 4.2 Batch Creation Detection
  const creationDays: Record<string, string[]> = {};
  data.nodes.forEach(node => {
    const date = node.createdAt.split('T')[0]; // YYYY-MM-DD
    if (!creationDays[date]) creationDays[date] = [];
    creationDays[date].push(node.id);
  });

  const batchCreationGroups = Object.entries(creationDays)
    .filter(([_, ids]) => ids.length > 5) // At least 6 nodes created on the same day
    .map(([date, nodeIds]) => ({ date, nodeIds }));

  // Calculate Fingerprint Score and integrate into Suspect Score
  const nodeScores = data.nodes.map(node => {
    let score = 0;
    
    // 4.1 Synch_Index (0.35) - Slightly reduced to make room
    const synchIndex = coordinatedNodes.has(node.id) ? 100 : 0;
    score += synchIndex * 0.35;
    
    // 4.2 Meta_Age_Index (0.25)
    const createdDate = new Date(node.createdAt);
    const ageInDays = (new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
    const metaAgeIndex = ageInDays < 30 ? 100 : ageInDays < 90 ? 60 : ageInDays < 365 ? 30 : 0;
    score += metaAgeIndex * 0.25;
    
    // 4.3 Freq_Index (0.2)
    let freqIndex = 0;
    const entropyScore = analyzeHandleEntropy(node.handle);
    if (entropyScore > 50) freqIndex += 40; 
    
    // Profile Completeness
    if (!node.avatar) freqIndex += 15;
    if (!node.description || node.description.length < 10) freqIndex += 10;
    
    // Ratios
    const follows = node.followsCount || 0;
    const followers = node.followersCount || 0;
    if (follows > 200 && followers < 10) freqIndex += 25;
    if (followers > 0 && (followers / (follows || 1)) < 0.02) freqIndex += 20;
    
    // Activity
    if (node.postsCount !== undefined && node.postsCount < 3) freqIndex += 20;
    
    if (node.isBotCandidate) freqIndex += 20;
    score += Math.min(100, freqIndex) * 0.2;

    // 4.4 Fingerprint_Index (0.2) - Domain & Server analysis
    let fingerprintIndex = 0;
    const hasSharedDomain = fingerprintClusters.some(c => c.nodeIds.includes(node.id));
    const isPartOfBatch = batchCreationGroups.some(g => g.nodeIds.includes(node.id));
    const isCustomPDS = !node.handle.endsWith('.bsky.social');
    
    if (hasSharedDomain) fingerprintIndex += 40;
    if (isPartOfBatch) fingerprintIndex += 40;
    if (isCustomPDS) fingerprintIndex += 20; // Slight suspicion for custom domains in clusters
    
    score += Math.min(100, fingerprintIndex) * 0.2;
    
    return score;
  });

  const avgSuspectScore = nodeScores.length > 0 
    ? nodeScores.reduce((acc, s) => acc + s, 0) / nodeScores.length 
    : 0;

  // Identify nodes with high probability as bots
  const botCount = nodeScores.filter(score => score > 65).length;
  const botDensity = (botCount / data.nodes.length) * 100;

  const totalReach = data.nodes.reduce((acc, n) => acc + (n.followersCount || 0), 0);

  const possibleEdges = (data.nodes.length * (data.nodes.length - 1)) / 2;
  const networkDensity = possibleEdges > 0 ? (data.edges.length / possibleEdges) * 100 : 0;

  return {
    coordinatedNodeIds: Array.from(coordinatedNodes),
    sockpuppetGroups,
    topLinks: sortedLinks,
    avgToxicity,
    botDensity,
    totalReach,
    networkDensity,
    avgSuspectScore,
    burstClusters: Object.entries(timeBuckets)
      .map(([time, ids]) => ({ time, count: ids.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    fingerprintClusters,
    batchCreationGroups
  };
}

function calculateSimilarity(s1: string, s2: string): number {
  const set1 = new Set(s1.toLowerCase().split(/\s+/));
  const set2 = new Set(s2.toLowerCase().split(/\s+/));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

export function analyzeHandleEntropy(handle: string): number {
  const namePart = handle.split('.')[0];
  const vowels = namePart.match(/[aeiouäöü]/gi);
  const vowelRatio = vowels ? vowels.length / namePart.length : 0;
  
  let score = 0;
  // Vokalarmut (Vowel Poverty)
  if (vowelRatio < 0.2) score += 40;
  // Digit Suffix (e.g., name1234)
  if (/\d{4,}$/.test(namePart)) score += 30;
  // Random-looking strings (consecutive consonants)
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(namePart)) score += 30;
  
  return Math.min(100, score);
}
