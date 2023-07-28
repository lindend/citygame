const BiDirectionalEdge = 0;
const IncomingEdge = 1;
const OutgoingEdge = 2;

export type EdgeDirection =
  | typeof BiDirectionalEdge
  | typeof IncomingEdge
  | typeof OutgoingEdge;

type Edge<TNode> = {
  name: string;
  to: GraphNode<TNode>;
  direction: EdgeDirection;
  visited: number;
};

export class GraphNode<TNode> {
  key: string;
  data: TNode;

  /** @internal */
  public _visited: number;
  /** @internal */
  public _edges: Edge<TNode>[] = [];

  /** @internal */
  constructor(key: string, data: TNode, visited: number) {
    this.key = key;
    this.data = data;
    this._visited = visited;
  }

  getData(): TNode {
    return this.data;
  }
}

export class Graph<TNode> {
  visitedNum = 0;
  vertices: GraphNode<TNode>[];

  constructor() {
    this.vertices = [];
  }

  addNode(key: string, data: TNode): GraphNode<TNode> {
    const node = new GraphNode<TNode>(key, data, this.visitedNum);
    this.vertices.push(node);
    return node;
  }

  addEdge(node0: GraphNode<TNode>, node1: GraphNode<TNode>, key: string) {
    node0._edges.push({
      name: key,
      to: node1,
      direction: BiDirectionalEdge,
      visited: this.visitedNum,
    });
    node1._edges.push({
      name: key,
      to: node0,
      direction: BiDirectionalEdge,
      visited: this.visitedNum,
    });
  }

  dfs(
    node: GraphNode<TNode>,
    predicate: (node: GraphNode<TNode>) => boolean
  ): GraphNode<TNode>[] {
    const visitedIdx = this.visitedNum++;
    let result: GraphNode<TNode>[] = [];

    let nodesToVisit = [node];
    node._visited = visitedIdx;

    while (nodesToVisit.length > 0) {
      const node = nodesToVisit[nodesToVisit.length - 1];
      if (predicate(node)) {
        result.push(node);
      }

      for (let edge of node._edges) {
        const to = edge.to;
        if (to._visited !== visitedIdx) {
          to._visited = visitedIdx;
          nodesToVisit.push(to);
        }
      }
    }
    return result;
  }
}
