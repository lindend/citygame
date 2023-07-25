import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { Scene } from "@babylonjs/core/scene";

export type AssetPalette = { [key: string]: Color3 };

export type AssetSpec = {
  id: string;
  file: string;
  palettes: AssetPalette[];
};

export function asset(file: string, palettes?: AssetPalette[]): AssetSpec {
  return {
    id: file,
    file,
    palettes: palettes || [],
  };
}

export type LoadedAsset = {
  asset: AssetContainer;
  spec: AssetSpec;
  center: Vector3;
};

export type AssetSpecs<T> = { [k in keyof T]: AssetSpec };

export type Assets<T> = { [k in keyof T]: LoadedAsset };

export type LoadedAssets<T extends (...args: any) => any> =
  ReturnType<T> extends Promise<infer U> ? U : never;

export async function loadAssets<TAssets extends {}>(
  root: string,
  assets: AssetSpecs<TAssets>,
  scene: Scene
): Promise<Assets<TAssets>> {
  const objKeys = Object.keys(assets) as Array<keyof TAssets>;
  const promises = objKeys.map(async (asset): Promise<LoadedAsset> => {
    const fileName = assets[asset].file;
    const assetContainer = await SceneLoader.LoadAssetContainerAsync(
      root,
      fileName,
      scene
    );
    const boundingVectors = assetContainer.rootNodes.map((r) =>
      r.getHierarchyBoundingVectors(true)
    );
    boundingVectors.push(
      ...assetContainer.transformNodes.map((t) =>
        t.getHierarchyBoundingVectors(true)
      )
    );
    const { min, max } = boundingVectors.reduce(({ min, max }, current) => {
      return {
        min: Vector3.Minimize(min, current.min),
        max: Vector3.Maximize(max, current.max),
      };
    });

    // Center is the amount the object needs to be moved to have it's
    // origin at 0, _, 0 in model space
    const center = max.add(min).multiply(new Vector3(-0.5, 0, -0.5));

    return {
      asset: assetContainer,
      spec: assets[asset],
      center,
    };
  });
  const results = await Promise.all(promises);
  const resultEntries = objKeys.map<[keyof TAssets, LoadedAsset]>((k, i) => [
    k,
    results[i],
  ]);
  return Object.fromEntries(resultEntries) as Assets<TAssets>;
}
