import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Game } from "../../game";
import { Zone, meshItem } from "../zone";

export const smallSuburbanTiles = [smallSuburbanTile1];

export function smallSuburbanTile1(game: Game): Zone {
  return {
    size: "small",
    items: [
      meshItem(
        "house1",
        game.assets.suburban.house01,
        new Vector3(-0.5, 0, 0.4),
        { rotation: new Vector3(0, Math.PI, 0) }
      ),
      meshItem(
        "driveway",
        game.assets.suburban.driveway,
        new Vector3(-0.7, 0, 0.45),
        { scale: new Vector3(1, 1, 2.0) }
      ),
      meshItem(
        "path",
        game.assets.suburban.path,
        new Vector3(-0.175, 0, 0.45),
        { scale: new Vector3(1, 1, 2.0) }
      ),
      meshItem(
        "tree_dw1",
        game.assets.suburban.tree_large,
        new Vector3(-0.81, 0, 0.76)
      ),
      meshItem(
        "tree_dw2",
        game.assets.suburban.tree_small,
        new Vector3(-0.6, 0, 0.7)
      ),
    ],
  };
}
