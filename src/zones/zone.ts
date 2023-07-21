import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { LoadedAsset } from "../assets/loadAssets";

export type ZoneMeshItem = {
  type: "mesh";
  name: string;
  mesh: LoadedAsset;
  position: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
  castsShadows?: boolean;
};

export function meshItem(
  name: string,
  mesh: LoadedAsset,
  position: Vector3,
  optional?: { rotation?: Vector3; scale?: Vector3; castsShadows?: boolean }
): ZoneMeshItem {
  return {
    type: "mesh",
    name,
    mesh,
    position,
    rotation: optional?.rotation,
    scale: optional?.scale,
    castsShadows: optional?.castsShadows,
  };
}

export type ZoneSize = "small" | "medium" | "large";
export type ZoneType = "commercial" | "suburban";
export type ZoneItem = ZoneMeshItem;

export type Zone = {
  items: ZoneItem[];
  size: ZoneSize;
};
