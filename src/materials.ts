import { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scene } from "@babylonjs/core/scene";
import { ZoneType } from "./zones/zone";
import { GrassProceduralTexture } from "@babylonjs/procedural-textures/grass/grassProceduralTexture";

export function tileZoneOutline(name: string, scene: Scene, color: Color3) {
  const material = new StandardMaterial(name, scene);
  material.disableLighting = true;
  material.emissiveColor = color;
  return material;
}

export function tileZoneFill(name: string, scene: Scene, color: Color3) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = color;
  material.specularColor = Color3.BlackReadOnly;
  return material;
}

type TileZoneMaterials = {
  outline: Material;
  fill: Material;
};

export type ZoneMaterials = { [key in ZoneType]: TileZoneMaterials };
export type Materials = {
  zones: ZoneMaterials;
  ground: StandardMaterial;
  default: StandardMaterial;
  default_inverted: StandardMaterial;
  window: StandardMaterial;
  window_inverted: StandardMaterial;
};

function createStandardMaterial(name: string, scene: Scene) {
  const material = new StandardMaterial(name, scene);
  material.specularColor = Color3.BlackReadOnly;
  return material;
}

export function materials(scene: Scene): Materials {
  const materials = {
    zones: {
      suburban: {
        outline: tileZoneOutline(
          "suburban_outline",
          scene,
          new Color3(0.45, 0.83, 0.39)
        ),
        fill: tileZoneFill("suburban_fill", scene, new Color3(0.8, 0.85, 0.8)),
      },
      commercial: {
        outline: tileZoneOutline(
          "commercial_outline",
          scene,
          new Color3(0.45, 0.39, 0.83)
        ),
        fill: tileZoneFill(
          "commercial_fill",
          scene,
          new Color3(0.8, 0.8, 0.85)
        ),
      },
    },
    default: createStandardMaterial("default_citygame", scene),
    default_inverted: createStandardMaterial(
      "default_citygame_inverted",
      scene
    ),
    ground: createStandardMaterial("ground", scene),
    window: createStandardMaterial("citygame_window", scene),
    window_inverted: createStandardMaterial("citygame_window_inverted", scene),
  };

  materials.default.sideOrientation = Material.ClockWiseSideOrientation;
  materials.window.sideOrientation = Material.ClockWiseSideOrientation;
  materials.default_inverted.sideOrientation =
    Material.CounterClockWiseSideOrientation;
  materials.window_inverted.sideOrientation =
    Material.CounterClockWiseSideOrientation;

  materials.ground.diffuseColor = new Color3(0.47, 0.75, 0.02);
  materials.ground.disableDepthWrite = true;

  const grassTexture = new GrassProceduralTexture("ground", 1024, scene);
  grassTexture.grassColors = [
    new Color3(0.47, 0.75, 0.02),
    new Color3(0.41, 0.72, 0.01),
    new Color3(0.96, 0.99, 0.91),
  ];
  grassTexture.refreshRate = 0;
  materials.ground.diffuseTexture = grassTexture;

  return materials;
}
