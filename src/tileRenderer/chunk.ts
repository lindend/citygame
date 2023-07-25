import { Tile } from "../world/tile";
import { Game } from "../game";
import { AssetPalette, LoadedAsset } from "../assets/loadAssets";
import { getTileAssets } from "./tileAssets";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { createBaseTile } from "./tileGeometry";
import { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Nullable } from "@babylonjs/core/types";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";

type ChunkAssetMesh = {
  mesh: Mesh;
  materialName: string;
  defaultColor: Color3;
};

type ChunkAssetInstance = {
  asset: LoadedAsset;
  meshes: ChunkAssetMesh[];
};
type ChunkAsset = { [key: string]: ChunkAssetInstance };
function getDiffuseColor(material: Nullable<Material>): Color3 {
  if (material == null) {
    return Color3.Purple();
  }

  switch (material.getClassName()) {
    case "PBRMaterial":
      const pbr = material as PBRMaterial;
      return pbr.albedoColor;
    case "StandardMaterial":
      const mat = material as StandardMaterial;
      return mat.diffuseColor;
    default:
      return Color3.Purple();
  }
}

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
      this.tileMesh.receiveShadows = true;
    }
    this.tileMesh.thinInstanceAdd(transform, false);

    for (let i = 0; i < tileAssets.length; ++i) {
      const ta = tileAssets[i];
      const assetId = ta.asset.spec.id + (ta.inverted ? "_inv" : "");
      if (!this.meshes[assetId]) {
        this.meshes[assetId] = this.addAsset(assetId, ta.asset, ta.inverted);
      }

      const meshes = this.meshes[assetId];
      const palette = getRandomPalette(ta.asset.spec.palettes);
      for (let mesh of meshes.meshes) {
        const meshTransform = ta.transform.multiply(transform);
        // Workaround for a bug where the built-in mesh is pre-multiplied with
        // the thin instance transform
        const builtInMeshTransform = mesh.mesh.getWorldMatrix();
        let inverted = Matrix.Invert(builtInMeshTransform);
        // meshTrans.mult(inverted) -> Inv * MeshTrans
        // BuiltIn.mult(Inv*MeshTrans) -> Inv*MeshTrans*BuiltIn
        const workaroundTransform = builtInMeshTransform.multiply(
          meshTransform.multiply(inverted)
        );
        const idx = mesh.mesh.thinInstanceAdd(workaroundTransform, false);
        const color = palette[mesh.materialName] || mesh.defaultColor;
        mesh.mesh.thinInstanceSetAttributeAt("color", idx, [
          color.r,
          color.g,
          color.b,
          1,
        ]);
      }
    }
  }

  build() {
    for (let mesh of Object.values(this.meshes)) {
      mesh.meshes.forEach((m) => {
        m.mesh.thinInstanceBufferUpdated("matrix");
        m.mesh.thinInstanceBufferUpdated("color");
        m.mesh.thinInstanceRefreshBoundingInfo(false);
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
    const meshNodes = added.rootNodes.flatMap((r) => r.getChildMeshes<Mesh>());
    const meshes = meshNodes.map((m) => {
      m.makeGeometryUnique();

      this.game.shadows.addShadowCaster(m);
      m.receiveShadows = true;

      // Work-around for a bug(?) in babylonjs that prevents inverted meshes
      // from listening to side orientation from materials.
      m.overrideMaterialSideOrientation = null;
      const oldMaterial = m.material;
      const defaultColor = getDiffuseColor(oldMaterial);
      m.material = !inverted
        ? this.game.materials.default
        : this.game.materials.default_inverted;

      m.thinInstanceRegisterAttribute("color", 4);
      return {
        mesh: m,
        materialName: oldMaterial?.name || "",
        defaultColor,
      };
    });
    return {
      asset,
      meshes,
    };
  }
}
function getRandomPalette(palettes: AssetPalette[]): AssetPalette {
  if (palettes.length == 0) {
    return {};
  }

  const idx = Math.floor(Math.random() * palettes.length);
  return palettes[idx];
}
