import { BskyAgent } from '@atproto/api';

const agent = new BskyAgent({ service: 'https://public.api.bsky.app' });

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string; // DID
  handle: string;
  displayName?: string;
  avatar?: string;
  description?: string;
  weight: number;
  toxicity?: number;
  isRoot?: boolean;
  createdAt: string; // ISO date
  isBotCandidate?: boolean;
  repostTimes?: string[]; // Times this user reposted the target
  links?: string[]; // Links found in bio
  isCoordinated?: boolean; // Flagged by synchronicity detector
  isSockpuppet?: boolean; // Flagged by metadata similarity
}

export interface GraphEdge extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;
  createdAt: string; // ISO date
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function resolveHandle(handle: string) {
  try {
    const { data } = await agent.getProfile({ actor: handle });
    return data;
  } catch (err) {
    console.error("Failed to resolve handle", err);
    throw new Error("Could not find user.");
  }
}

export async function fetchAmplifications(did: string, deepScan: boolean = false, onProgress?: (msg: string) => void): Promise<GraphData> {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();

  const addNode = (profile: any, isRoot = false, defaultWeight = 1) => {
    if (!profile) return;
    if (!nodes.has(profile.did)) {
      // Extract links from bio
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const bioLinks = profile.description?.match(urlRegex) || [];

      nodes.set(profile.did, {
        id: profile.did,
        handle: profile.handle,
        displayName: profile.displayName,
        avatar: profile.avatar,
        description: profile.description,
        weight: defaultWeight,
        isRoot,
        createdAt: profile.createdAt || new Date().toISOString(),
        isBotCandidate: (profile.handle.replace(/[^0-9]/g, "").length > 4) || 
                         (profile.description?.toLowerCase().includes("bot") ?? false),
        repostTimes: [],
        links: bioLinks,
      });
    } else if (isRoot) {
      nodes.get(profile.did)!.isRoot = true;
    }
  };

  const addEdge = (sourceId: string, targetId: string, weight = 1) => {
    if (sourceId === targetId) return; // Prevent self-loops
    const edgeId = `${sourceId}->${targetId}`;
    if (edges.has(edgeId)) {
      edges.get(edgeId)!.weight += weight;
    } else {
      edges.set(edgeId, { source: sourceId, target: targetId, weight, createdAt: new Date().toISOString() });
    }
    // Boost node weights slightly
    if (nodes.has(sourceId)) nodes.get(sourceId)!.weight += 0.2 * weight;
    if (nodes.has(targetId)) nodes.get(targetId)!.weight += 0.2 * weight;
  };

  try {
    onProgress?.("Sammle Profil-Daten...");
    const rootProfile = await resolveHandle(did);
    const rootDid = rootProfile.did;
    addNode(rootProfile, true, 25);

    onProgress?.("Lade Follower des Accounts...");
    try {
      // First, get followers of the central account
      const followersRes = await agent.api.app.bsky.graph.getFollowers({ actor: rootDid, limit: deepScan ? 150 : 50 });
      for (const f of followersRes.data.followers) {
        addNode(f, false, 2);
        addEdge(f.did, rootDid, 1);
      }
    } catch(e) {
      console.warn("Could not fetch followers", e);
    }

    onProgress?.("Suche aktive Multiplikatoren (Reposts)...");
    try {
      // Enrich with people actively amplifying them to ensure we get the strongest nodes
      const rawFeed = await agent.getAuthorFeed({ actor: rootDid, limit: deepScan ? 50 : 15, filter: 'posts_no_replies' });
      for (const item of rawFeed.data.feed) {
        if ((item.post as any).author?.did === rootDid) {
          try {
            const reposters = await agent.api.app.bsky.feed.getRepostedBy({ uri: item.post.uri, limit: deepScan ? 50 : 15 });
            for (const reposter of reposters.data.repostedBy) {
              addNode(reposter, false, 5);
              addEdge(reposter.did, rootDid, 3);
              
              // Track repost time for synchronicity
              const node = nodes.get(reposter.did);
              if (node && (item.post as any).indexedAt) {
                if (!node.repostTimes) node.repostTimes = [];
                node.repostTimes.push((item.post as any).indexedAt);
              }

              // Update edge timestamp if post is older
              const edgeId = `${reposter.did}->${rootDid}`;
              if (edges.has(edgeId)) {
                edges.get(edgeId)!.createdAt = (item.post as any).indexedAt || edges.get(edgeId)!.createdAt;
              }
            }
          } catch (e) {
            // Ignore if error on specific post
          }
        }
      }
    } catch(e) {
      console.warn("Could not fetch amplifiers", e);
    }

    const allDids = Array.from(nodes.keys()).filter(d => d !== rootDid);

    onProgress?.("Prüfe Netzwerk der Follower untereinander...");
    
    // Chunk requests to avoid rate limits
    // For each follower, we check who they follow and if it's someone in our current graph
    const chunkSize = 8;
    for (let i = 0; i < allDids.length; i += chunkSize) {
      const chunk = allDids.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async (targetDid) => {
        try {
          const follows = await agent.api.app.bsky.graph.getFollows({ actor: targetDid, limit: deepScan ? 200 : 80 });
          for (const follow of follows.data.follows) {
            if (nodes.has(follow.did) && follow.did !== rootDid && follow.did !== targetDid) {
              addEdge(targetDid, follow.did, 2); // Internal network edge!
            }
          }
        } catch (err) {
          // skip on errors
        }
      }));
      onProgress?.(`Verbindungen werden analysiert (${Math.min(i + chunkSize, allDids.length)}/${allDids.length})...`);
    }

    onProgress?.("Netzwerk fertigstellen...");
    
    return {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges.values())
    };

  } catch (err) {
    console.error(err);
    throw err;
  }
}
