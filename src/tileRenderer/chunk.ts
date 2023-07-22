import { Tile } from "../world/tile";
import { Game } from "../game";
import { LoadedAsset } from "../assets/loadAssets";
import { getTileAssets } from "./tileAssets";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { createBaseTile } from "./tileGeometry";
import { Material } from "@babylonjs/core/Materials/material";

type ChunkAssetInstance = {
  asset: LoadedAsset;
  meshes: Mesh[];
};
type ChunkAsset = { [key: string]: ChunkAssetInstance };

export class Chunk {
  private name: string;
  private chunkNode: TransformNode;
  private game: Game;
  private meshes: ChunkAsset = {};
  private tileMesh: Mesh | undefined;

  constructor(name: string, game: Game) {
    this.name = name;
    this.game = game;
    this.chunkNode = new TransformNode("chunk_" + name, game.scene);
  }

  addTile(tile: Tile, position: Vector3) {
    const tileAssets = getTileAssets(tile, this.game);
    const transform = Matrix.Translation(position.x, position.y, position.z);

    if (!this.tileMesh) {
      this.tileMesh = createBaseTile("tile_base", this.game.scene);
      this.tileMesh.parent = this.chunkNode;
    }
    this.tileMesh.thinInstanceAdd(transform, false);

    for (let i = 0; i < tileAssets.length; ++i) {
      const ta = tileAssets[i];
      const assetId = ta.asset.spec.id + (ta.inverted ? "_inv" : "");
      if (!this.meshes[assetId]) {
        this.meshes[assetId] = this.addAsset(assetId, ta.asset, ta.inverted);
      }

      const meshes = this.meshes[assetId];
      for (let j = 0; j < meshes.meshes.length; ++j) {
        const meshTransform = ta.transform; //transform.multiply(tileAssets[i].transform);
        meshes.meshes[j].thinInstanceAdd(meshTransform, false);
      }
    }
  }

  build() {
    for (let mesh of Object.values(this.meshes)) {
      mesh.meshes.forEach((m) => {
        m.thinInstanceBufferUpdated("matrix");
        m.thinInstanceRefreshBoundingInfo(false);
      });
    }
    this.tileMesh?.thinInstanceBufferUpdated("matrix");
    this.tileMesh?.thinInstanceRefreshBoundingInfo(false);
  }

  private addAsset(
    assetId: string,
    asset: LoadedAsset,
    inverted: boolean
  ): ChunkAssetInstance {
    const added = asset.asset.instantiateModelsToScene(
      (srcName) => (srcName == "__root__" ? assetId : srcName),
      true
    );
    added.rootNodes.forEach((n) => (n.parent = this.chunkNode));
    const meshes = added.rootNodes.flatMap((r) => r.getChildMeshes<Mesh>());
    meshes.forEach((m) => {
      if (m.material) {
        m.material.sideOrientation = !inverted
          ? Material.ClockWiseSideOrientation
          : Material.CounterClockWiseSideOrientation;
        if (inverted) {
          m.material.backFaceCulling = false;
        }
      }
      m.makeGeometryUnique();
    });
    return {
      asset,
      meshes,
    };
  }
}
