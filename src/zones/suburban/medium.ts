import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Zone, meshItem } from "../zone";
import { Game } from "../../game";
import { smallSuburbanTile1 as smallSuburbanTile1 } from "./small";

export const mediumSuburbanTiles = [mediumSuburbanTile1];

export function mediumSuburbanTile1(game: Game): Zone {
  const smallTile = smallSuburbanTile1(game);
  return {
    size: "medium",
    items: [
      ...smallTile.items,
      ...[
        new Vector3(0.25, 0, 0.7),
        new Vector3(0.55, 0, 0.8),
        new Vector3(0.42, 0, 0.5),
      ].map((pos, i) =>
        meshItem("tree_lg" + i, game.assets.suburban.tree_large, pos)
      ),
      meshItem(
        "tree_sm_1",
        game.assets.suburban.tree_small,
        new Vector3(0.28, 0, 0.55)
      ),
    ],
  };
}
