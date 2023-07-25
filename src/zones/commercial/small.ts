import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Game } from "../../game";
import { Zone, meshItem } from "../zone";

export const smallCommercialTiles = [
  smallCommercialTile1,
  smallCommercialTile2,
  smallCommercialTile3,
  smallCommercialTile4,
  smallCommercialTile5,
];

export function smallCommercialTile1(game: Game): Zone {
  return {
    size: "small",
    items: [
      meshItem(
        "building1",
        game.assets.commercial.small_buildingC,
        new Vector3(0.5, 0, 0.5),
        { rotation: new Vector3(0, Math.PI, 0) }
      ),
    ],
  };
}

export function smallCommercialTile2(game: Game): Zone {
  return {
    size: "small",
    items: [
      meshItem(
        "building1",
        game.assets.commercial.small_buildingA,
        new Vector3(0.5, 0, 0.5),
        { rotation: new Vector3(0, Math.PI, 0) }
      ),
    ],
  };
}

export function smallCommercialTile3(game: Game): Zone {
  return {
    size: "small",
    items: [
      meshItem(
        "building1",
        game.assets.commercial.small_buildingB,
        new Vector3(0.5, 0, 0.5),
        { rotation: new Vector3(0, Math.PI, 0) }
      ),
    ],
  };
}
export function smallCommercialTile4(game: Game): Zone {
  return {
    size: "small",
    items: [
      meshItem(
        "building1",
        game.assets.commercial.small_buildingD,
        new Vector3(0.5, 0, 0.5),
        { rotation: new Vector3(0, Math.PI, 0) }
      ),
    ],
  };
}
export function smallCommercialTile5(game: Game): Zone {
  return {
    size: "small",
    items: [
      meshItem(
        "building1",
        game.assets.commercial.small_buildingE,
        new Vector3(0.5, 0, 0.5),
        { rotation: new Vector3(0, Math.PI, 0) }
      ),
    ],
  };
}
