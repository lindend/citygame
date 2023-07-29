import {
  CommercialSide,
  EmptySide,
  RoadSide,
  SuburbanSide,
  Tile,
  TileSideType,
} from "./world/tile";

function getNumRoads() {
  let rng = Math.random();
  if (rng <= 0.5) {
    return 2;
  } else {
    return 3;
  }
}

function randomSideType(): TileSideType {
  let rng = Math.random();
  if (rng <= 0.5) {
    return SuburbanSide(0);
  } else {
    return CommercialSide(0);
  }
}

export function randomTile(): Tile {
  let sides: TileSideType[] = [
    EmptySide(),
    EmptySide(),
    EmptySide(),
    EmptySide(),
  ];

  let numRoads = getNumRoads();

  for (let i = 0; i < numRoads; ++i) {
    let rngSide = 0;
    do {
      rngSide = Math.floor(Math.random() * sides.length);
    } while (sides[rngSide].type == "road");
    sides[rngSide] = RoadSide(0, 0);
  }

  for (let i = 0; i < sides.length; ++i) {
    if (sides[i].type == "empty") {
      sides[i] = randomSideType();
    }
  }

  return new Tile(sides);
}
