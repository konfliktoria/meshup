// import '../styles/globals.css'

import {
  useState, useEffect, useMemo,
  useRef,
} from 'react';
import * as d3 from 'd3';
import * as React from 'react';
import { Member } from '../models/team';

interface MemberNode extends d3.SimulationNodeDatum {
  id: string
  r: number
  name: string
}

interface MemberLink extends d3.SimulationLinkDatum<MemberNode> {
  source: MemberNode
  target: MemberNode
  strength: number,
  forward: number,
  backward?: number,
}

interface MemberGraphProps {
  members: Member[],
  getWeights: () => { srcIdx: number, trgIdx: number, forward: number, backward?: number }[],
  partitions: number[],
  bidirectional?: boolean,
  maxWidth?: number
}

export default function MemberGraph({
  members, getWeights, partitions, maxWidth, bidirectional,
}: MemberGraphProps) {
  const minDistBetweenNodes = 5;
  const linkColorMap = [
    'red', // strength <0
    'black', // strength 0
    'green', // strength >0
  ];
  const defaultNodeColor = '#CCC';

  // const svgRef = useRef<SVGSVGElement>(null);

  const simulationRef = useRef<d3.Simulation<MemberNode, MemberLink> | null>(null);
  const [animatedNodes, setAnimatedNodes] = useState<MemberNode[]>([]);
  const [animatedLinks, setAnimatedLinks] = useState<MemberLink[]>([]);
  const nodeRadius = useMemo(() => Math.max(...members.map((member) => member.name.length * 4), 25), [members]);

  const [hoveredNodeIdx, setHoveredNodeIdx] = useState<number | null>(null);

  const nodes = useMemo(
    () => members.map((member) => {
      const oldNode = animatedNodes.find((node) => node.id === member.id);
      if (oldNode) {
        return Object.assign(oldNode, { r: nodeRadius });
      }
      return {
        id: member.id,
        name: member.name,
        r: nodeRadius,
        x: NaN,
        y: NaN,
      };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members, nodeRadius],
  );

  const links = useMemo(
    () => getWeights().map(({
      srcIdx, trgIdx, forward, backward,
    }) => ({
      source: nodes[srcIdx],
      target: nodes[trgIdx],
      strength: backward !== undefined ? (forward + backward) / 2 : forward,
      backward,
      forward,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getWeights],
  );

  useEffect(() => {
    if (simulationRef.current != null) {
      // TODO does this really help when quickly re-running useEffects?
      simulationRef.current.stop();
    }

    const linkSimulation = d3.forceLink<MemberNode, MemberLink>();
    linkSimulation.strength(((link) => (link.strength < 0 ? link.strength * 0.002 : link.strength * 0.01)));
    linkSimulation.distance(0);

    const simulation = d3.forceSimulation<MemberNode, MemberLink>()
      .force('link', linkSimulation)
      .force('charge', d3.forceManyBody().strength(-1000 - nodeRadius * 25))
      .force('collision', d3.forceCollide(nodeRadius + minDistBetweenNodes))
      .force('center', d3.forceCenter(500 / 2, 500 / 2)) // TODO
      .force('x', d3.forceX(100))
      .force('y', d3.forceY(100))
      .nodes([...nodes]);
    linkSimulation.links([...links]);

    simulation
      .on('tick', () => {
        setAnimatedNodes([...simulation.nodes()]);
        setAnimatedLinks([...linkSimulation.links()]);
      });

    simulation.alpha(0.6).restart();
    simulationRef.current = simulation;

    return () => { simulation.stop(); };
  }, [nodes, links, nodeRadius]);

  function getViewBox() {
    const paddedNodeRadius = nodeRadius + 5;

    const minX = Math.min(...animatedNodes.map((n) => n.x as number)) - paddedNodeRadius;
    const maxX = Math.max(...animatedNodes.map((n) => n.x as number)) + paddedNodeRadius;
    const minY = Math.min(...animatedNodes.map((n) => n.y as number)) - paddedNodeRadius;
    const maxY = Math.max(...animatedNodes.map((n) => n.y as number)) + paddedNodeRadius;

    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }

  function polylinePoints(link: MemberLink) {
    const sx = link.source.x!!;
    const sy = link.source.y!!;
    const tx = link.target.x!!;
    const ty = link.target.y!!;

    const sw = Math.min(2 * nodeRadius, Math.abs(link.forward) + 1) / 2;
    const tw = Math.min(2 * nodeRadius, Math.abs(link.backward!!) + 1) / 2;

    const angleSourceTarget = Math.atan2(ty - sy, tx - sx);
    const orthoSourceTarget = angleSourceTarget - Math.PI / 2;

    return `${sx - Math.cos(orthoSourceTarget) * sw},${sy - Math.sin(orthoSourceTarget) * sw} 
            ${sx + Math.cos(orthoSourceTarget) * sw},${sy + Math.sin(orthoSourceTarget) * sw}
            ${tx + Math.cos(orthoSourceTarget) * tw},${ty + Math.sin(orthoSourceTarget) * tw}
            ${tx - Math.cos(orthoSourceTarget) * tw},${ty - Math.sin(orthoSourceTarget) * tw}`;
  }

  const nodeColors: string[] = useMemo(() => {
    if (partitions.length === 0) {
      return members.map(() => defaultNodeColor);
    }

    const nPartitions = Math.max(...partitions);
    if (nPartitions <= 9) {
      return partitions.map((p) => d3.schemeTableau10[p]);
    }

    // https://github.com/d3/d3-scale-chromatic
    const colorPalette = d3.interpolateCubehelixDefault;
    // if (hoveredNodeIdx !== null) {
    //   const pHovered = partitioning[hoveredNodeIdx];
    //   return partitioning.map((p) => (p === pHovered ? colorPalette(p / nPartitions) : defaultNodeColor));
    // }
    return partitions.map((p) => colorPalette((p / nPartitions) * 0.5 + 0.25));
  }, [partitions, /* hoveredNodeIdx, */members]);

  return (
    <div>
      {members.length > 1
        ? (
          <svg
            width="auto"
            style={{
              aspectRatio: 'auto',
              maxHeight: '80vh', // TODO
              ...(maxWidth !== null ? { maxWidth: `${maxWidth}px` } : {}),
            }}
            viewBox={getViewBox()}
          >
            <g strokeOpacity={0.8}>
              {animatedLinks.map((link) => (link.backward !== undefined
                ? (
                  <polyline
                    key={`link-${link.source.id}-${link.target.id}`}
                    points={`${polylinePoints(link)}`}
                    style={{ fill: linkColorMap[Math.sign(link.strength) + 1] }}
                  />
                )
                : (
                  <line
                    key={`link-${link.source.id}-${link.target.id}`}
                    x1={link.source.x}
                    x2={link.target.x}
                    y1={link.source.y}
                    y2={link.target.y}
                    style={{ stroke: linkColorMap[Math.sign(link.strength) + 1] }}
                    strokeWidth={Math.min(2 * nodeRadius, Math.abs(link.strength) + 1)}
                    strokeDasharray={link.strength === 0 ? 5 : 0}
                  />
                )))}
            </g>
            {animatedNodes.map((node, i) => (
              <g
                className="node"
                transform={`translate(${node.x}, ${node.y})`}
                key={node.id}
                onMouseEnter={() => { setHoveredNodeIdx(i); }}
                onMouseLeave={() => { if (hoveredNodeIdx === i) { setHoveredNodeIdx(null); } }}
              >
                {(hoveredNodeIdx !== null && partitions !== null
                  && partitions[i] === partitions[hoveredNodeIdx])
                  && (<circle fill="red" r={node.r + 2} />)}
                <circle fill={nodeColors[i]} r={node.r} />
                <text y={5} fill="black" fontSize={13} textAnchor="middle">{node.name}</text>
              </g>
            ))}
          </svg>
        ) : 'More team members required.'}
    </div>
  );
}

MemberGraph.defaultProps = {
  maxWidth: null,
  bidirectional: false,
};
