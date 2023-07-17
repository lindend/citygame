import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Game } from "../../game";
import { Zone, meshItem } from "../zone";
import { smallCommercialTile1 } from "./small";

export const mediumCommercialTiles = [mediumCommercialTile1];

export function mediumCommercialTile1(game: Game): Zone {
  return {
    size: "medium",
    items: [...smallCommercialTile1(game).items],
  };
}
