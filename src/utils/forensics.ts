import { GraphData, GraphNode } from '../services/bsky';

export interface ForensicsResults {
  coordinatedNodeIds: string[];
  sockpuppetGroups: string[][];
  topLinks: { url: string; count: number }[];
  avgToxicity: number;
  botDensity: number;
  totalReach: number;
  networkDensity: number;
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

  const botCount = data.nodes.filter(n => n.isBotCandidate).length;
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
    networkDensity
  };
}

function calculateSimilarity(s1: string, s2: string): number {
  const set1 = new Set(s1.toLowerCase().split(/\s+/));
  const set2 = new Set(s2.toLowerCase().split(/\s+/));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}
