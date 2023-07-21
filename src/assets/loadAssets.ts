import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { Scene } from "@babylonjs/core/scene";

export type AssetPalette = {
  materialColor: { [key: string]: Color3 };
};

export type AssetSpec = {
  file: string;
  palettes: AssetPalette[];
};

export function asset(file: string): AssetSpec {
  return {
    file,
    palettes: [],
  };
}

export type LoadedAsset = {
  asset: AssetContainer;
  spec: AssetSpec;
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
    return {
      asset: assetContainer,
      spec: assets[asset],
    };
  });
  const results = await Promise.all(promises);
  const resultEntries = objKeys.map<[keyof TAssets, LoadedAsset]>((k, i) => [
    k,
    results[i],
  ]);
  return Object.fromEntries(resultEntries) as Assets<TAssets>;
}
