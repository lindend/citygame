import { Matrix, Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import {
  createBaseTile,
  createBaseTileOutline,
} from "../tileRenderer/tileGeometry";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { TileRotation, World } from "../world/world";
import { Tile } from "../world/tile";
import { randomTile } from "../randomTile";
import { getTileAssets } from "../tileRenderer/tileAssets";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { IPointerEvent } from "@babylonjs/core/Events/deviceInputEvents";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CameraController } from "../cameraController";
import { DayNightCycleController } from "../environment/dayNightCycleController";
import { Game } from "./game";
import { IGameState } from "./gameState";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { WeatherController } from "../environment/weathers/weatherController";

enum PlaceHighlightMode {
  None,
  CanPlace,
  CanNotPlace,
}

export class PlayingGameState implements IGameState {
  private game: Game;
  private world: World;

  private camController: CameraController;
  private dayNight: DayNightCycleController;
  private weather: WeatherController;

  private previewPlaceTile: Mesh;
  private previewPlaceTileOutline: Mesh;
  private previewTileMeshes: TransformNode;
  private placeHighlightMode: PlaceHighlightMode = PlaceHighlightMode.None;
  private canPlaceHighlightColor = new Color3(0, 0.7, 0);
  private canNotPlaceHighlightColor = new Color3(0.7, 0, 0);
  private glowLayer: GlowLayer;
  private previewPlaceTileMaterial: StandardMaterial;

  private currentTile: Tile = new Tile([]);
  private currentTileRotation: TileRotation = 0;
  private currentTilePosition: Vector2 = Vector2.Zero();

  constructor(game: Game, world: World) {
    this.game = game;
    this.world = world;
    this.camController = new CameraController(game.camera, game.input);
    this.dayNight = new DayNightCycleController(game);
    this.weather = new WeatherController(game);

    this.glowLayer = new GlowLayer("placeTileHighlight", this.game.scene);
    this.glowLayer.intensity = 0.6;
    this.glowLayer.blurKernelSize = 16;

    this.previewPlaceTileMaterial = new StandardMaterial(
      "placeHighlightMaterial",
      this.game.scene
    );
    this.previewPlaceTile = createBaseTile("placeHighlight", this.game.scene);
    this.previewPlaceTile.visibility = 0;

    this.previewPlaceTileOutline = createBaseTileOutline(
      "placeTilePreviewOutline",
      this.game.scene,
      0.1
    );
    this.previewPlaceTileOutline.parent = this.previewPlaceTile;
    this.previewPlaceTileOutline.material = this.previewPlaceTileMaterial;

    this.glowLayer.addIncludedOnlyMesh(this.previewPlaceTileOutline);

    this.previewTileMeshes = new TransformNode(
      "previewMeshes",
      this.game.scene
    );
    this.previewTileMeshes.parent = this.previewPlaceTile;

    this.createNewTile();

    this.game.scene.onPointerDown = (evt) => this.onPointerDown(evt);
  }

  createNewTile() {
    this.previewTileMeshes.getChildren().forEach((c) => {
      c.dispose();
    });
    this.game.scene.renderingManager.maintainStateBetweenFrames = false;
    this.game.scene.renderingManager.maintainStateBetweenFrames = true;

    this.currentTile = randomTile();
    this.setCurrentTileRotation(0);

    const assets = getTileAssets(this.currentTile, this.game);
    for (let a of assets) {
      const instances = a.asset.asset.instantiateModelsToScene(
        undefined,
        false,
        {
          doNotInstantiate: true,
        }
      );
      instances.rootNodes.forEach((r) => {
        const tfmNode = new TransformNode("highlight", this.game.scene);
        tfmNode.parent = this.previewTileMeshes;
        tfmNode.setPreTransformMatrix(a.transform);

        r.parent = tfmNode;
      });
    }
  }

  setCurrentTileRotation(rot: TileRotation) {
    this.currentTileRotation = rot;
    this.previewPlaceTile.rotation = new Vector3(0, (rot * Math.PI) / 2, 0);
  }

  onPointerDown(evt: IPointerEvent) {
    if (evt.button == 0) {
      if (
        this.world.place(
          this.currentTile,
          this.currentTilePosition,
          this.currentTileRotation,
          false
        )
      ) {
        this.world.renderer.build();
        this.createNewTile();
      }
    } else if (evt.button == 2) {
      const [_, newRot] = this.tryRotatingTile(
        this.currentTilePosition,
        ((this.currentTileRotation + 1) % 4) as TileRotation
      );
      this.currentTileRotation = newRot;
    }
  }

  setHighlightMode(mode: PlaceHighlightMode) {
    if (mode == this.placeHighlightMode) {
      return;
    }
    this.previewPlaceTileMaterial.emissiveColor = Color3.BlackReadOnly;
    if (mode == PlaceHighlightMode.CanPlace) {
      this.previewPlaceTile.visibility = 1;
      this.previewPlaceTileMaterial.emissiveColor = this.canPlaceHighlightColor;
    } else if (mode == PlaceHighlightMode.CanNotPlace) {
      this.previewPlaceTile.visibility = 1;
      this.previewPlaceTileMaterial.emissiveColor =
        this.canNotPlaceHighlightColor;
    } else {
      this.previewPlaceTile.position = new Vector3(-100000, -20, 0);
      this.previewPlaceTile.visibility = 0;
    }
    this.placeHighlightMode = mode;
  }

  tryRotatingTile(
    position: Vector2,
    startRotation: TileRotation
  ): [boolean, TileRotation] {
    if (this.world.canPlace(this.currentTile, position, startRotation)) {
      return [true, startRotation];
    }

    for (let i = 0; i < 4; ++i) {
      const rotation = ((i + startRotation) % 4) as TileRotation;
      if (this.world.canPlace(this.currentTile, position, rotation)) {
        return [true, rotation];
      }
    }

    return [false, startRotation];
  }

  updatePointerHighlight() {
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
          this.currentTilePosition,
          this.currentTileRotation
        );
        this.setCurrentTileRotation(newRot);
        this.previewPlaceTile.position = highlightTilePos;

        if (canPlace) {
          this.setHighlightMode(PlaceHighlightMode.CanPlace);
        } else {
          this.setHighlightMode(PlaceHighlightMode.CanNotPlace);
        }
      }
    } else {
      this.setHighlightMode(PlaceHighlightMode.None);
    }
  }

  update(delta: number): void {
    this.updatePointerHighlight();
    this.camController.update(delta);
    this.weather.update(delta);
    this.dayNight.update(delta);
  }
}
