import { GraphData } from '../services/bsky';
import { ForensicsResults } from './forensics';

export interface Community {
  id: string;
  name: string;
  nodes: string[];
  color: string;
  description: string;
}

export const detectCommunities = (data: GraphData, forensics: ForensicsResults): Community[] => {
  // Mock community detection for now
  const communities: Community[] = [
    {
      id: 'core',
      name: 'Core Cluster',
      nodes: data.nodes.slice(0, 10).map(n => n.id),
      color: '#00f2ff',
      description: 'Zentrales Netzwerk des Ziel-Accounts.'
    },
    {
      id: 'amplifier',
      name: 'Amplifier Hub',
      nodes: forensics.coordinatedNodeIds.slice(0, 20),
      color: '#bc13fe',
      description: 'Koordinierte Verstärker-Accounts.'
    }
  ];
  
  return communities;
};
