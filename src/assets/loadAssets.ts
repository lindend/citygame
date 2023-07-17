import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { Scene } from "@babylonjs/core/scene";

type Assets<T> = { [k in keyof T]: AssetContainer };

export type LoadedAssets<T extends (...args: any) => any> =
  ReturnType<T> extends Promise<infer U> ? U : never;

export async function loadAssets<TAssets extends {}>(
  root: string,
  assets: TAssets,
  scene: Scene
): Promise<Assets<TAssets>> {
  const objKeys = Object.keys(assets) as Array<keyof TAssets>;
  const promises = objKeys.map((asset) =>
    SceneLoader.LoadAssetContainerAsync(root, assets[asset], scene)
  );
  const results = await Promise.all(promises);
  const resultEntries = objKeys.map<[keyof TAssets, AssetContainer]>((k, i) => [
    k,
    results[i],
  ]);
  return Object.fromEntries(resultEntries) as Assets<TAssets>;
}
