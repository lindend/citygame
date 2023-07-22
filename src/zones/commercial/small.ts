import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Game } from "../../game";
import { Zone, meshItem } from "../zone";

export const smallCommercialTiles = [smallCommercialTile1];

export function smallCommercialTile1(game: Game): Zone {
  return {
    size: "small",
    items: [
      meshItem(
        "building1",
        game.assets.commercial.small_buildingC,
        new Vector3(-0.442, 0, 0.547),
        { rotation: new Vector3(0, Math.PI, 0) }
      ),
    ],
  };
}
