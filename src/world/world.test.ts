import { test, describe, expect, vi, beforeEach } from "vitest";
import { RoadSide, SuburbanSide, Tile } from "./tile";
import { World } from "./world";
import { Chunk } from "../tileRenderer/chunk";
import { mock } from "vitest-mock-extended";
import { Vector2 } from "@babylonjs/core/Maths/math.vector";

describe("world", () => {
  let world: World;
  let tile0: Tile;

  describe("place", () => {
    describe("right", () => {
      beforeEach(() => {
        const chunk = mock<Chunk>();
        world = new World(chunk);
        tile0 = new Tile([
          RoadSide(0, 0), // Top
          RoadSide(0, 0), // Right
          SuburbanSide(0), // Bot
          SuburbanSide(0), // Left
        ]);
        expect(world.place(tile0, new Vector2(0, 0), 0)).toBeTruthy();
      });

      test("valid", () => {
        const tile1 = new Tile([
          RoadSide(0, 0), // Top
          SuburbanSide(0), // Right
          SuburbanSide(0), // Bot
          RoadSide(0, 0), // Left
        ]);
        expect(world.place(tile1, new Vector2(1, 0), 0)).toBeTruthy();
      });

      test("invalid", () => {
        const tile1 = new Tile([
          RoadSide(0, 0), // Top
          SuburbanSide(0), // Right
          RoadSide(0, 0), // Bot
          SuburbanSide(0), // Left
        ]);
        expect(world.place(tile1, new Vector2(1, 0), 0)).toBeFalsy();
      });
    });

    describe("left", () => {
      beforeEach(() => {
        const chunk = mock<Chunk>();
        world = new World(chunk);
        tile0 = new Tile([
          RoadSide(0, 0), // Top
          SuburbanSide(0), // Right
          SuburbanSide(0), // Bot
          RoadSide(0, 0), // Left
        ]);
        expect(world.place(tile0, new Vector2(0, 0), 0)).toBeTruthy();
      });

      test("valid", () => {
        const tile1 = new Tile([
          SuburbanSide(0), // Top
          RoadSide(0, 0), // Right
          SuburbanSide(0), // Bot
          RoadSide(0, 0), // Left
        ]);
        expect(world.place(tile1, new Vector2(-1, 0), 0)).toBeTruthy();
      });

      test("invalid", () => {
        const tile1 = new Tile([
          RoadSide(0, 0), // Top
          SuburbanSide(0), // Right
          RoadSide(0, 0), // Bot
          SuburbanSide(0), // Left
        ]);
        expect(world.place(tile1, new Vector2(-1, 0), 0)).toBeFalsy();
      });
    });

    describe("above", () => {
      beforeEach(() => {
        const chunk = mock<Chunk>();
        world = new World(chunk);
        tile0 = new Tile([
          RoadSide(0, 0), // Top
          RoadSide(0, 0), // Right
          SuburbanSide(0), // Bot
          SuburbanSide(0), // Left
        ]);
        expect(world.place(tile0, new Vector2(0, 0), 0)).toBeTruthy();
      });

      test("valid", () => {
        const tile1 = new Tile([
          SuburbanSide(0), // Top
          SuburbanSide(0), // Right
          RoadSide(0, 0), // Bot
          SuburbanSide(0), // Left
        ]);
        expect(world.place(tile1, new Vector2(0, 1), 0)).toBeTruthy();
      });

      test("invalid", () => {
        const tile1 = new Tile([
          SuburbanSide(0), // Top
          RoadSide(0, 0), // Right
          SuburbanSide(0), // Bot
          SuburbanSide(0), // Left
        ]);
        expect(world.place(tile1, new Vector2(0, 1), 0)).toBeFalsy();
      });
    });

    describe("below", () => {
      beforeEach(() => {
        const chunk = mock<Chunk>();
        world = new World(chunk);
        tile0 = new Tile([
          SuburbanSide(0), // Top
          RoadSide(0, 0), // Right
          RoadSide(0, 0), // Bot
          SuburbanSide(0), // Left
        ]);
        expect(world.place(tile0, new Vector2(0, 0), 0)).toBeTruthy();
      });

      test("valid", () => {
        const tile1 = new Tile([
          RoadSide(0, 0), // Top
          SuburbanSide(0), // Right
          SuburbanSide(0), // Bot
          SuburbanSide(0), // Left
        ]);
        expect(world.place(tile1, new Vector2(0, -1), 0)).toBeTruthy();
      });

      test("invalid", () => {
        const tile1 = new Tile([
          SuburbanSide(0), // Top
          SuburbanSide(0), // Right
          RoadSide(0, 0), // Bot
          SuburbanSide(0), // Left
        ]);
        expect(world.place(tile1, new Vector2(0, -1), 0)).toBeFalsy();
      });
    });
    describe("rotated", () => {
      beforeEach(() => {
        const chunk = mock<Chunk>();
        world = new World(chunk);
        tile0 = new Tile([
          RoadSide(0, 0), // Top
          SuburbanSide(0), // Right
          SuburbanSide(0), // Bot
          SuburbanSide(0), // Left
        ]);
        expect(world.place(tile0, new Vector2(0, 0), 1)).toBeTruthy();
      });

      test("valid", () => {
        const tile1 = new Tile([
          RoadSide(0, 0), // Top
          SuburbanSide(0), // Right
          SuburbanSide(0), // Bot
          SuburbanSide(0), // Left
        ]);
        expect(world.place(tile1, new Vector2(1, 0), 3)).toBeTruthy();
      });

      test("invalid", () => {
        const tile1 = new Tile([
          SuburbanSide(0), // Top
          SuburbanSide(0), // Right
          RoadSide(0, 0), // Bot
          SuburbanSide(0), // Left
        ]);
        expect(world.place(tile1, new Vector2(1, 0), 2)).toBeFalsy();
      });
    });
  });
  describe("unconnectedRoads", () => {
    beforeEach(() => {
      const chunk = mock<Chunk>();
      world = new World(chunk);
      tile0 = new Tile([
        RoadSide(0, 0), // Top
        RoadSide(0, 0), // Right
        SuburbanSide(0), // Bot
        SuburbanSide(0), // Left
      ]);
      expect(world.place(tile0, new Vector2(0, 0), 1)).toBeTruthy();
    });
    test("startingNodesAreCorrect", () => {
      const unconnectedRoads = world.getUnconnectedRoads();
      expect(unconnectedRoads).length(2);

      expect(
        unconnectedRoads.findIndex((v) =>
          v.equalsWithEpsilon(new Vector2(1, 0))
        )
      ).to.be.greaterThanOrEqual(0);
      expect(
        unconnectedRoads.findIndex((v) =>
          v.equalsWithEpsilon(new Vector2(0, -1))
        )
      ).to.be.greaterThanOrEqual(0);
    });
    test("nodesAfterAddAreCorrect", () => {
      const tile1 = new Tile([
        RoadSide(0, 0), // Top
        SuburbanSide(0), // Right
        RoadSide(0, 0), // Bot
        SuburbanSide(0), // Left
      ]);
      expect(world.place(tile1, new Vector2(1, 0), 1)).toBeTruthy();

      const unconnectedRoads = world.getUnconnectedRoads();

      expect(unconnectedRoads).length(2);

      expect(
        unconnectedRoads.findIndex((v) =>
          v.equalsWithEpsilon(new Vector2(2, 0))
        )
      ).to.be.greaterThanOrEqual(0);
      expect(
        unconnectedRoads.findIndex((v) =>
          v.equalsWithEpsilon(new Vector2(0, -1))
        )
      ).to.be.greaterThanOrEqual(0);
    });
  });
});
