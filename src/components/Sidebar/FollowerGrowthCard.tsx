import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { GraphData } from '../../services/bsky';
import { TrendingUp, Info } from 'lucide-react';

interface FollowerGrowthCardProps {
  graphData: GraphData | null;
  isLoading: boolean;
}

export default function FollowerGrowthCard({ graphData, isLoading }: FollowerGrowthCardProps) {
  const chartRef = useRef<SVGSVGElement>(null);

  const data = useMemo(() => {
    if (!graphData || graphData.nodes.length === 0) return [];
    
    const rootNode = graphData.nodes.find(n => n.isRoot);
    const rootDate = rootNode?.createdAt ? new Date(rootNode.createdAt) : new Date();

    const followers = graphData.nodes.filter(n => !n.isRoot && n.createdAt);
    
    // Group "legacy" accounts (created before rootDate)
    const legacyCount = followers.filter(f => new Date(f.createdAt!) < rootDate).length;
    
    // Followers created after rootDate
    const newFollowers = followers
      .filter(f => new Date(f.createdAt!) >= rootDate)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

    let cumulativeCount = legacyCount;
    const result = [{ date: rootDate, count: legacyCount }];

    newFollowers.forEach(node => {
      cumulativeCount++;
      result.push({
        date: new Date(node.createdAt!),
        count: cumulativeCount
      });
    });

    // Add current time point to extend the line to today
    result.push({
      date: new Date(),
      count: cumulativeCount
    });

    return result;
  }, [graphData]);

  const xDomain = useMemo(() => {
    if (data.length === 0) return null;
    const rootNode = graphData?.nodes.find(n => n.isRoot);
    const rootDate = rootNode?.createdAt ? new Date(rootNode.createdAt) : new Date();
    return [rootDate, new Date()];
  }, [data, graphData]);

  useEffect(() => {
    if (!chartRef.current || data.length < 2 || !xDomain) return;

    const svg = d3.select(chartRef.current);
    const width = chartRef.current.clientWidth;
    const height = chartRef.current.clientHeight;
    const margin = { top: 10, right: 10, bottom: 20, left: 35 };

    svg.selectAll("*").remove();

    const x = d3.scaleTime()
      .domain(xDomain)
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) as number])
      .range([height - margin.bottom, margin.top]);

    // Area Gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "growth-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#00f2ff")
      .attr("stop-opacity", 0.4);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#00f2ff")
      .attr("stop-opacity", 0);

    // Glow Filter
    const filter = defs.append("filter")
      .attr("id", "line-glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");

    filter.append("feGaussianBlur")
      .attr("stdDeviation", "2")
      .attr("result", "blur");
    
    filter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");

    // Area
    const area = d3.area<any>()
      .x(d => x(d.date))
      .y0(y(0))
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "url(#growth-gradient)")
      .attr("d", area);

    // Grid lines (horizontal)
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(3).tickSize(-width + margin.left + margin.right).tickFormat(() => ""))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("line").attr("stroke", "#1e293b").attr("stroke-dasharray", "2,2"));

    // Line
    const line = d3.line<any>()
      .x(d => x(d.date))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#00f2ff")
      .attr("stroke-width", 2)
      .attr("d", line)
      .attr("filter", "url(#line-glow)");

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(4).tickSizeOuter(0))
      .call(g => g.select(".domain").attr("stroke", "#1e293b"))
      .call(g => g.selectAll("text").attr("fill", "#64748b").attr("font-size", "7px").attr("font-family", "monospace"))
      .call(g => g.selectAll("line").attr("stroke", "#1e293b"));

    // Y Axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(3).tickSizeOuter(0))
      .call(g => g.select(".domain").attr("stroke", "#1e293b"))
      .call(g => g.selectAll("text").attr("fill", "#64748b").attr("font-size", "7px").attr("font-family", "monospace"))
      .call(g => g.selectAll("line").attr("stroke", "#1e293b"));

  }, [data, xDomain, graphData]);

  const last24hCount = useMemo(() => {
    if (!graphData) return 0;
    const now = new Date();
    const oneDayAgo = now.getTime() - (24 * 60 * 60 * 1000);
    return graphData.nodes.filter(n => {
      if (n.isRoot || !n.createdAt) return false;
      return new Date(n.createdAt).getTime() > oneDayAgo;
    }).length;
  }, [graphData]);

  if (isLoading) {
    return (
      <div className="h-40 flex items-center justify-center bg-slate-900/20 rounded-xl border border-slate-800/50">
        <div className="animate-pulse text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-2">
          <TrendingUp className="w-3 h-3 animate-bounce" /> Analyzing Temporal Growth...
        </div>
      </div>
    );
  }

  if (data.length < 2) {
    return null;
  }

  return (
    <div className="space-y-4 pt-4 border-t border-slate-800/50">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-neon-blue" /> Follower Evolution
        </h3>
        <div className="group relative">
          <Info className="w-3 h-3 text-slate-600 cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-cyber-black/95 backdrop-blur-xl border border-slate-800 rounded-lg text-[9px] leading-relaxed text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
            Kumulative Darstellung der Account-Alter im Follower-Netzwerk ab Profilerstellung. Steile Anstiege deuten auf koordinierte "Batch Creations" hin.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-2">
         <div className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-2">
            <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest block mb-1">Accounts (Total)</span>
            <span className="text-xs font-mono font-black text-slate-200">{data[data.length - 1]?.count || 0}</span>
         </div>
         <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-lg p-2">
            <span className="text-[7px] text-neon-blue uppercase font-black tracking-widest block mb-1">Neu (24h Proxy)</span>
            <span className="text-xs font-mono font-black text-neon-blue flex items-center gap-1">
               +{last24hCount}
               <span className="text-[8px] text-neon-blue/40 font-normal">IDs</span>
            </span>
         </div>
      </div>

      <div className="bg-slate-900/30 rounded-xl border border-slate-800/50 p-2 overflow-hidden relative group">
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-cyber-black/80 rounded border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-pulse"></span>
           <span className="text-[7px] font-mono text-slate-500 uppercase">Live Sample: {data.length}</span>
        </div>
        <svg ref={chartRef} className="w-full h-32"></svg>
      </div>

      <div className="flex justify-between items-center px-1">
        <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Profil-Erstellung</div>
        <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Heute</div>
      </div>
    </div>
  );
}
