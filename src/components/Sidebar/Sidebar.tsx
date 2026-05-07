import React from 'react';
import NodeDetailCard from './NodeDetailCard';
import MultipliersCard from './MultipliersCard';
import ForensicsCard from './ForensicsCard';
import InterventionCard from './InterventionCard';
import { GraphNode, GraphData } from '../../services/bsky';
import { ForensicsResults } from '../../utils/forensics';

interface SidebarProps {
  selectedNode: GraphNode | null;
  onCloseNodeDetail: () => void;
  onSimulateBlock: (id: string) => void;
  topAmplifiers: GraphNode[] | null;
  isLoading: boolean;
  onNodeClick: (node: GraphNode) => void;
  onHelpClick: (id: string) => void;
  forensics: ForensicsResults | null;
  blockedNodeIds: string[];
  influenceLost: number;
  graphData: GraphData | null;
  onRemoveBlock: (id: string) => void;
  onExportBlocklist: () => void;
}

export default function Sidebar({
  selectedNode,
  onCloseNodeDetail,
  onSimulateBlock,
  topAmplifiers,
  isLoading,
  onNodeClick,
  onHelpClick,
  forensics,
  blockedNodeIds,
  influenceLost,
  graphData,
  onRemoveBlock,
  onExportBlocklist
}: SidebarProps) {
  return (
    <aside className="w-full md:w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pb-4 md:pb-0 h-full scrollbar-hide">
      {selectedNode ? (
        <NodeDetailCard 
          selectedNode={selectedNode} 
          onClose={onCloseNodeDetail} 
          onSimulateBlock={onSimulateBlock} 
        />
      ) : (
        <>
          <MultipliersCard 
            topAmplifiers={topAmplifiers} 
            isLoading={isLoading} 
            onNodeClick={onNodeClick} 
            selectedNodeId={selectedNode?.id}
            onHelpClick={onHelpClick}
          />
          
          <ForensicsCard 
            forensics={forensics} 
            onHelpClick={onHelpClick} 
          />
          
          <InterventionCard 
            blockedNodeIds={blockedNodeIds}
            influenceLost={influenceLost}
            graphData={graphData}
            topAmplifier={topAmplifiers && topAmplifiers.length > 0 ? topAmplifiers[0] : null}
            onRemoveBlock={onRemoveBlock}
            onExportBlocklist={onExportBlocklist}
            onHelpClick={onHelpClick}
          />
        </>
      )}
    </aside>
  );
}
