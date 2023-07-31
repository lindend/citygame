import { Game } from "../game/game";
import { mediumCommercialTiles } from "./commercial/medium";
import { mediumSuburbanTiles } from "./suburban/medium";
import { Zone, ZoneSize, ZoneType } from "./zone";

export type DecorationLookup = { [key in ZoneSize]: ((game: Game) => Zone)[] };
export type ZoneFactory = { [key in ZoneType]: DecorationLookup };

const commercial: DecorationLookup = {
  small: [],
  medium: mediumCommercialTiles,
  large: mediumCommercialTiles,
};

const suburban: DecorationLookup = {
  small: [],
  medium: mediumSuburbanTiles,
  large: mediumSuburbanTiles,
};

export const zoneFactory: ZoneFactory = {
  commercial,
  suburban,
};
