import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphEdge } from '../services/bsky';

interface NetworkGraphProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
}

export default function NetworkGraph({ data, onNodeClick }: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data.nodes.length) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear previous graph
    d3.select(containerRef.current).select('svg').remove();

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('cursor', 'grab')
      .call(d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
        g.attr('transform', event.transform);
      }))
      .on('mousedown.zoom', function() { d3.select(this).style('cursor', 'grabbing'); })
      .on('mouseup.zoom', function() { d3.select(this).style('cursor', 'grab'); });

    const g = svg.append('g');

    // Create a copy of the data as D3 will mutate it
    const nodes = data.nodes.map(d => ({ ...d }));
    const edges = data.edges.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(100).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => Math.sqrt(d.weight) * 4 + 10));

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.weight));

    let focusId: string | null = null;
    let selectedId: string | null = null;

    const isConnected = (a: any, b: any) => {
      return edges.some(e => 
        (e.source.id === a.id && e.target.id === b.id) ||
        (e.source.id === b.id && e.target.id === a.id)
      ) || a.id === b.id;
    };

    const updateHighlights = () => {
      const targetId = focusId || selectedId;
      
      node.selectAll('circle')
        .attr('opacity', (d: any) => {
          if (!targetId) return 1;
          const targetNode = nodes.find(n => n.id === targetId);
          return (targetNode && isConnected(d, targetNode)) ? 1 : 0.15;
        })
        .attr('stroke', (d: any) => d.id === selectedId ? '#22c55e' : '#fff')
        .attr('stroke-width', (d: any) => d.id === selectedId ? 3 : 1.5);

      node.selectAll('text')
        .attr('opacity', (d: any) => {
          if (!targetId) return 1;
          const targetNode = nodes.find(n => n.id === targetId);
          return (targetNode && isConnected(d, targetNode)) ? 1 : 0.15;
        })
        .attr('font-weight', (d: any) => d.id === selectedId ? 'bold' : 'normal');

      link
        .attr('stroke-opacity', (e: any) => {
          if (!targetId) return 0.6;
          return (e.source.id === targetId || e.target.id === targetId) ? 0.9 : 0.05;
        })
        .attr('stroke', (e: any) => {
          if (!targetId) return '#cbd5e1';
          return (e.source.id === targetId || e.target.id === targetId) ? '#3b82f6' : '#cbd5e1';
        });
    };

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(drag(simulation) as any)
      .on('mouseover', (event, d: any) => {
        focusId = d.id;
        updateHighlights();
      })
      .on('mouseout', () => {
        focusId = null;
        updateHighlights();
      })
      .on('click', (event, d: any) => {
        if (!event.defaultPrevented) {
          selectedId = d.id;
          updateHighlights();
          onNodeClickRef.current(d as GraphNode);
        }
      });

    // Node circles
    node.append('circle')
      .attr('r', d => Math.sqrt(d.weight) * 3 + 4)
      .attr('fill', d => d.isRoot ? '#3b82f6' : '#94a3b8')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Node avatars (optional, using image patterns if we had more time, simple text for now)
    node.append('text')
      .text(d => d.handle)
      .attr('x', 8)
      .attr('y', 3)
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif')
      .attr('fill', '#334155')
      .style('text-shadow', '0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      svg.attr('width', w).attr('height', h);
      simulation.force('center', d3.forceCenter(w / 2, h / 2));
      simulation.alpha(0.3).restart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      simulation.stop();
    };
  }, [data]);

  // Use a ref for onNodeClick so we don't need it in deps
  const onNodeClickRef = useRef(onNodeClick);
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  // Drag functionality
  function drag(simulation: d3.Simulation<GraphNode, undefined>) {
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-transparent relative overflow-hidden" />
  );
}
