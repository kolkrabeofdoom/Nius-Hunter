import React from 'react';
import NodeDetailCard from './NodeDetailCard';
import MultipliersCard from './MultipliersCard';
import ForensicsCard from './ForensicsCard';
import InterventionCard from './InterventionCard';
import DeepAnalysisCard from './DeepAnalysisCard';
import ComparisonCard from './ComparisonCard';
import CommunityCard from './CommunityCard';
import { GraphNode, GraphData } from '../../services/bsky';
import { ForensicsResults } from '../../utils/forensics';
import { DeepAnalysisResult } from '../../services/gemini';
import { ScanComparison } from '../../utils/history';
import { Community } from '../../utils/communities';

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
  onExportDossier: () => void;
  deepAnalysis: DeepAnalysisResult | null;
  isDeepAnalyzing: boolean;
  comparison: ScanComparison | null;
  oldTimestamp: string | null;
  onSaveSnapshot: () => void;
  communities: Community[];
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
  onExportBlocklist,
  onExportDossier,
  deepAnalysis,
  isDeepAnalyzing,
  comparison,
  oldTimestamp,
  onSaveSnapshot,
  communities
}: SidebarProps) {
  return (
    <aside className="w-full md:w-96 flex flex-col gap-8 shrink-0 overflow-y-auto pb-4 md:pb-0 h-full scrollbar-hide">
      {selectedNode ? (
        <NodeDetailCard 
          selectedNode={selectedNode} 
          onClose={onCloseNodeDetail} 
          onSimulateBlock={onSimulateBlock} 
        />
      ) : (
        <>
          {/* Intelligence Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-1">
              <div className="h-px flex-1 bg-slate-800"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Intelligence Hub</span>
              <div className="h-px flex-1 bg-slate-800"></div>
            </div>

            <ComparisonCard 
              comparison={comparison} 
              oldTimestamp={oldTimestamp} 
            />

            <CommunityCard 
              communities={communities} 
              onHelpClick={onHelpClick} 
            />
            
            <ForensicsCard 
              forensics={forensics} 
              onHelpClick={onHelpClick} 
            />

            <MultipliersCard 
              topAmplifiers={topAmplifiers} 
              isLoading={isLoading} 
              onNodeClick={onNodeClick} 
              selectedNodeId={selectedNode?.id}
              onHelpClick={onHelpClick}
            />

            <DeepAnalysisCard 
              result={deepAnalysis} 
              isAnalyzing={isDeepAnalyzing} 
            />
          </div>

          {/* Action Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-1">
              <div className="h-px flex-1 bg-slate-800"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Strategic Action</span>
              <div className="h-px flex-1 bg-slate-800"></div>
            </div>

            <InterventionCard 
              blockedNodeIds={blockedNodeIds}
              influenceLost={influenceLost}
              graphData={graphData}
              topAmplifier={topAmplifiers && topAmplifiers.length > 0 ? topAmplifiers[0] : null}
              onRemoveBlock={onRemoveBlock}
              onExportBlocklist={onExportBlocklist}
              onExportDossier={onExportDossier}
              onHelpClick={onHelpClick}
              onSaveSnapshot={onSaveSnapshot}
            />
          </div>
        </>
      )}
    </aside>
  );
}
