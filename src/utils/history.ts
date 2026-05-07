import { ForensicsResults } from './forensics';

export interface ScanHistoryEntry {
  id: string;
  handle: string;
  timestamp: string;
  nodes: Record<string, { weight: number; toxicity: number }>;
  forensics: ForensicsResults;
  narrativeSummary: string | null;
}

export interface ScanComparison {
  nodeCountDelta: number;
  newNodes: string[];
  toxicityDelta: number;
  reachDelta: number;
}

const STORAGE_KEY = 'nius_hunter_history';

export const getHistory = (): ScanHistoryEntry[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

export const saveScanToHistory = (
  handle: string,
  nodes: any[],
  forensics: ForensicsResults,
  narrativeSummary: string | null
) => {
  const history = getHistory();
  const newEntry: ScanHistoryEntry = {
    id: Date.now().toString(),
    handle,
    timestamp: new Date().toISOString(),
    nodes: nodes.reduce((acc, n) => ({ ...acc, [n.id]: { weight: n.weight, toxicity: n.toxicity || 0 } }), {}),
    forensics,
    narrativeSummary
  };
  
  // Keep only the most recent for each handle for now, or just append
  const updatedHistory = [newEntry, ...history.filter(h => h.handle !== handle)].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
};

export const compareScans = (oldScan: ScanHistoryEntry, newScan: ScanHistoryEntry): ScanComparison => {
  const oldNodeIds = Object.keys(oldScan.nodes);
  const newNodeIds = Object.keys(newScan.nodes);
  
  const newNodes = newNodeIds.filter(id => !oldNodeIds.includes(id));
  
  const oldAvgTox = oldNodeIds.length > 0 
    ? Object.values(oldScan.nodes).reduce((acc, n) => acc + n.toxicity, 0) / oldNodeIds.length
    : 0;
  const newAvgTox = newNodeIds.length > 0
    ? Object.values(newScan.nodes).reduce((acc, n) => acc + n.toxicity, 0) / newNodeIds.length
    : 0;
    
  return {
    nodeCountDelta: newNodeIds.length - oldNodeIds.length,
    newNodes,
    toxicityDelta: newAvgTox - oldAvgTox,
    reachDelta: 0 // Simplified
  };
};
