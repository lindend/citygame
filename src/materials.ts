import { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scene } from "@babylonjs/core/scene";
import { ZoneType } from "./zones/zone";

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
  default: StandardMaterial;
  default_inverted: StandardMaterial;
};

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
    default: new StandardMaterial("default_citygame", scene),
    default_inverted: new StandardMaterial("default_citygame_inverted", scene),
  };

  materials.default.specularColor = Color3.BlackReadOnly;
  materials.default_inverted.specularColor = Color3.BlackReadOnly;
  // materials.default.diffuseColor = Color3.Blue();
  // materials.default_inverted.diffuseColor = Color3.Blue();

  materials.default.sideOrientation = Material.ClockWiseSideOrientation;
  materials.default_inverted.sideOrientation =
    Material.CounterClockWiseSideOrientation;

  return materials;
}
