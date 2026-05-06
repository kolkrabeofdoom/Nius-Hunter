import { GraphData } from '../services/bsky';

export interface AnalysisResults {
  betweennessCentrality: Record<string, number>;
  bridgeNodes: string[];
}

export function calculateCentrality(data: GraphData): AnalysisResults {
  const { nodes, edges } = data;
  const adjacency: Record<string, string[]> = {};
  
  // Build adjacency list
  nodes.forEach(n => adjacency[n.id] = []);
  edges.forEach(e => {
    const s = typeof e.source === 'string' ? e.source : e.source.id;
    const t = typeof e.target === 'string' ? e.target : e.target.id;
    if (adjacency[s]) adjacency[s].push(t);
    if (adjacency[t]) adjacency[t].push(s); // Undirected for bridge detection
  });

  const centrality: Record<string, number> = {};
  nodes.forEach(n => centrality[n.id] = 0);

  // Simplified Brandes algorithm for betweenness centrality
  nodes.forEach(s => {
    const stack: string[] = [];
    const predecessors: Record<string, string[]> = {};
    const sigma: Record<string, number> = {};
    const dist: Record<string, number> = {};
    
    nodes.forEach(v => {
      preprocessors: predecessors[v.id] = [];
      sigma[v.id] = 0;
      dist[v.id] = -1;
    });

    sigma[s.id] = 1;
    dist[s.id] = 0;

    const queue: string[] = [s.id];
    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);
      for (const w of adjacency[v]) {
        if (dist[w] < 0) {
          dist[w] = dist[v] + 1;
          queue.push(w);
        }
        if (dist[w] === dist[v] + 1) {
          sigma[w] += sigma[v];
          predecessors[w].push(v);
        }
      }
    }

    const delta: Record<string, number> = {};
    nodes.forEach(v => delta[v.id] = 0);

    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of predecessors[w]) {
        delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      }
      if (w !== s.id) {
        centrality[w] += delta[w];
      }
    }
  });

  // Normalize and find bridges
  const maxCentrality = Math.max(...Object.values(centrality), 1);
  const bridgeNodes = nodes
    .filter(n => (centrality[n.id] / maxCentrality) > 0.4 && !n.isRoot)
    .map(n => n.id);

  return {
    betweennessCentrality: centrality,
    bridgeNodes
  };
}
