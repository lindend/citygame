import { LoadedAssets } from "./assets/loadAssets";
import { loadRoadAssets } from "./assets/roadAssets";
import { loadSuburbanAssets } from "./assets/suburbanAssets";
import { loadCommercialAssets } from "./assets/commercialAssets";
import { Scene } from "@babylonjs/core/scene";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Materials } from "./materials";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Matrix, Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { createBaseTile } from "./tileRenderer/tileGeometry";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { TileRotation, World } from "./world/world";
import { Tile } from "./world/tile";
import { randomTile } from "./randomTile";
import { IPointerEvent } from "@babylonjs/core/Events/deviceInputEvents";
import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";

export type Game = {
  scene: Scene;
  camera: Camera;
  shadows: ShadowGenerator;
  materials: Materials;
  ground: Mesh;
  state: IGameState;
  assets: {
    roads: LoadedAssets<typeof loadRoadAssets>;
    suburban: LoadedAssets<typeof loadSuburbanAssets>;
    commercial: LoadedAssets<typeof loadCommercialAssets>;
  };
};

export interface IGameState {
  update(delta: number): void;
}

export class EmptyGameState implements IGameState {
  update(delta: number): void {}
}

export class PlayingGameState implements IGameState {
  private game: Game;
  private world: World;

  private canPlaceHighlight: Mesh;
  private canNotPlaceHighlight: Mesh;
  private canPlaceHighlightColor = Color3.Green();
  private canNotPlaceHighlightColor = Color3.Red();
  private placeTileHighlightLayer: HighlightLayer;

  private currentTile: Tile;
  private currentTileRotation: TileRotation;
  private currentTilePosition: Vector2 = Vector2.Zero();

  constructor(game: Game, world: World) {
    this.game = game;
    this.world = world;

    this.placeTileHighlightLayer = new HighlightLayer(
      "placeTile",
      this.game.scene
    );

    this.canPlaceHighlight = createBaseTile(
      "canPlaceHighlight",
      this.game.scene
    );
    this.canPlaceHighlight.visibility = 0;

    this.canNotPlaceHighlight = createBaseTile(
      "canNotPlaceHighlight",
      this.game.scene
    );
    this.canNotPlaceHighlight.visibility = 0;

    this.currentTile = randomTile();
    this.currentTileRotation = 0;

    this.game.scene.onPointerDown = () => this.onPointerDown();
  }

  onPointerDown() {
    if (
      this.world.place(
        this.currentTile,
        this.currentTilePosition,
        this.currentTileRotation,
        false
      )
    ) {
      this.world.renderer.build();
      this.currentTile = randomTile();
      this.currentTileRotation = 0;
    }
  }

  setHighlightVisibility(mesh: Mesh, visibility: number, color: Color3) {
    if (mesh.visibility == visibility) {
      return;
    }
    mesh.visibility = visibility;
    if (visibility == 1) {
      this.placeTileHighlightLayer.addMesh(mesh, color);
    } else {
      this.placeTileHighlightLayer.removeMesh(mesh);
      mesh.position = new Vector3(-100000, -20, 0);
    }
  }

  tryRotatingTile(position: Vector2): [boolean, TileRotation] {
    if (
      this.world.canPlace(this.currentTile, position, this.currentTileRotation)
    ) {
      return [true, this.currentTileRotation];
    }

    for (let i = 0; i < 4; ++i) {
      if (this.world.canPlace(this.currentTile, position, i as TileRotation)) {
        return [true, i as TileRotation];
      }
    }

    return [false, this.currentTileRotation];
  }

  update(delta: number): void {
    const pickingRay = this.game.scene.createPickingRay(
      this.game.scene.pointerX,
      this.game.scene.pointerY,
      Matrix.Identity(),
      this.game.camera,
      false
    );

    const hit = this.game.scene.pickWithRay(
      pickingRay,
      (m) => m.name == this.game.ground.name
    );

    if (hit && hit.hit) {
      const pointerLocation = hit.pickedPoint;
      if (pointerLocation) {
        const tilePosition = pointerLocation
          .multiply(new Vector3(0.5, 0, 0.5))
          .add(new Vector3(0.5, 0, 0.5))
          .floor();
        this.currentTilePosition = new Vector2(tilePosition.x, tilePosition.z);
        const highlightTilePos = tilePosition.multiply(new Vector3(2, 2, 2));

        const [canPlace, newRot] = this.tryRotatingTile(
          this.currentTilePosition
        );
        this.currentTileRotation = newRot;

        if (canPlace) {
          this.setHighlightVisibility(
            this.canPlaceHighlight,
            1,
            this.canPlaceHighlightColor
          );
          this.setHighlightVisibility(
            this.canNotPlaceHighlight,
            0,
            this.canNotPlaceHighlightColor
          );
          this.canPlaceHighlight.position = highlightTilePos;
        } else {
          this.setHighlightVisibility(
            this.canPlaceHighlight,
            0,
            this.canPlaceHighlightColor
          );
          this.setHighlightVisibility(
            this.canNotPlaceHighlight,
            1,
            this.canNotPlaceHighlightColor
          );
          this.canNotPlaceHighlight.position = highlightTilePos;
        }
      }
    } else {
      this.setHighlightVisibility(
        this.canPlaceHighlight,
        0,
        this.canPlaceHighlightColor
      );
      this.setHighlightVisibility(
        this.canNotPlaceHighlight,
        0,
        this.canNotPlaceHighlightColor
      );
    }
  }
}

export function update(game: Game, delta: number) {
  game.state.update(delta);
}
