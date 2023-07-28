import { Scene } from "@babylonjs/core/scene";
import { AssetPalette, asset, loadAssets } from "./loadAssets";
import { Color3 } from "@babylonjs/core/Maths/math.color";

// House palette
function hp(walls: Color3, roof: Color3): AssetPalette {
  return {
    _defaultMat: walls,
    roof,
  };
}

const blackRoof = new Color3(0.15, 0.15, 0.15);
const brickRoof = new Color3(0.8, 0.44, 0.25);

const whiteWalls = new Color3(0.97, 0.97, 0.97);
const yellowWalls = new Color3(0.99, 0.84, 0.22);
const blueWalls = new Color3(0, 0.1, 0.6);
const brickWalls = new Color3(0.8, 0.44, 0.25);
const grayWalls = new Color3(0.67, 0.65, 0.63);

// Tree palette
function tp(trunk: Color3, leaves: Color3): AssetPalette {
  return {
    roof: leaves,
    wood: trunk,
  };
}

const trunk0 = new Color3(0.25, 0.2, 0.02);
const trunk1 = new Color3(0.7, 0.51, 0.34);
const trunk2 = new Color3(0.55, 0.5, 0.45);
const trunk3 = new Color3(0.64, 0.69, 0.52);

const leaf0 = new Color3(0.51, 0.67, 0.37);
const leaf1 = new Color3(0.64, 0.88, 0.22);
const leaf2 = new Color3(0.38, 0.77, 0.19);
const leaf3 = new Color3(0.44, 0.68, 0.08);
const leaf4 = new Color3(0.62, 0.82, 0.11);

const palettes = {
  house: [
    hp(yellowWalls, blackRoof),
    hp(whiteWalls, blackRoof),
    hp(brickWalls, blackRoof),
    hp(grayWalls, blackRoof),
    hp(blueWalls, brickRoof),
    hp(grayWalls, brickRoof),
  ],
  tree: [
    tp(trunk0, leaf0),
    tp(trunk0, leaf1),
    tp(trunk0, leaf2),
    tp(trunk0, leaf3),
    tp(trunk0, leaf4),

    tp(trunk1, leaf0),
    tp(trunk1, leaf1),
    tp(trunk1, leaf2),
    tp(trunk1, leaf3),
    tp(trunk1, leaf4),

    tp(trunk2, leaf0),
    tp(trunk2, leaf1),
    tp(trunk2, leaf2),
    tp(trunk2, leaf3),
    tp(trunk2, leaf4),

    tp(trunk3, leaf0),
    tp(trunk3, leaf1),
    tp(trunk3, leaf2),
    tp(trunk3, leaf3),
    tp(trunk3, leaf4),
  ],
};

const assetRoot = "./assets/city/suburban/";
const assets = {
  house01: asset("house_type01.glb", palettes.house),
  house02: asset("house_type02.glb"),
  house05: asset("house_type05.glb"),
  tree_large: asset("tree_large.glb", palettes.tree),
  tree_small: asset("tree_small.glb", palettes.tree),
  driveway: asset("driveway_short.glb"),
  path: asset("path_short.glb"),
};

export function loadSuburbanAssets(scene: Scene, root: string = assetRoot) {
  return loadAssets(root, assets, scene);
}
