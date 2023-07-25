import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Game } from "../../game";
import { Zone, meshItem } from "../zone";
import {
  smallCommercialTile1,
  smallCommercialTile2,
  smallCommercialTile3,
  smallCommercialTile4,
  smallCommercialTile5,
} from "./small";

export const mediumCommercialTiles = [
  mediumCommercialTile1,
  mediumCommercialTile2,
  mediumCommercialTile3,
  mediumCommercialTile4,
  mediumCommercialTile5,
];

export function mediumCommercialTile1(game: Game): Zone {
  return {
    size: "medium",
    items: [...smallCommercialTile1(game).items],
  };
}
export function mediumCommercialTile2(game: Game): Zone {
  return {
    size: "medium",
    items: [...smallCommercialTile2(game).items],
  };
}
export function mediumCommercialTile3(game: Game): Zone {
  return {
    size: "medium",
    items: [...smallCommercialTile3(game).items],
  };
}
export function mediumCommercialTile4(game: Game): Zone {
  return {
    size: "medium",
    items: [...smallCommercialTile4(game).items],
  };
}
export function mediumCommercialTile5(game: Game): Zone {
  return {
    size: "medium",
    items: [...smallCommercialTile5(game).items],
  };
}
