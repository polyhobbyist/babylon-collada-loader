import { readFile } from 'fs/promises';
import * as BABYLON from "babylonjs";


export class DAEFileLoader implements BABYLON.ISceneLoaderPluginAsync, BABYLON.ISceneLoaderPluginFactory {
  public name = "dae";
  public extensions = ".dae";

  private _assetContainer: BABYLON.Nullable<BABYLON.AssetContainer> = null;

  createPlugin(): BABYLON.ISceneLoaderPluginAsync | BABYLON.ISceneLoaderPlugin {
    return new DAEFileLoader();
  }

  public importMeshAsync(meshesNames: any, scene: BABYLON.Scene, data: any, rootUrl: string): Promise<BABYLON.ISceneLoaderAsyncResult> {
    return this._parseSolid(meshesNames, scene, data, rootUrl).then((meshes) => {
      return {
          meshes: meshes,
          particleSystems: [],
          skeletons: [],
          animationGroups: [],
          transformNodes: [],
          geometries: [],
          lights: [],
      };
    });
  }  

  public loadAsync(scene: BABYLON.Scene, data: string, rootUrl: string): Promise<void> {
    //Get the 3D model
    return this.importMeshAsync(undefined, scene, data, rootUrl).then(() => {
        // return void
    });
  }

    public loadAssetContainerAsync(scene: BABYLON.Scene, data: string, rootUrl: string): Promise<BABYLON.AssetContainer> {
        const container = new BABYLON.AssetContainer(scene);
        this._assetContainer = container;

        return this.importMeshAsync(undefined, scene, data, rootUrl)
            .then((result) => {
                result.meshes.forEach((mesh) => container.meshes.push(mesh));
                result.meshes.forEach((mesh) => {
                    const material = mesh.material;
                    if (material) {
                        // Materials
                        if (container.materials.indexOf(material) == -1) {
                            container.materials.push(material);

                            // Textures
                            const textures = material.getActiveTextures();
                            textures.forEach((t) => {
                                if (container.textures.indexOf(t) == -1) {
                                    container.textures.push(t);
                                }
                            });
                        }
                    }
                });
                this._assetContainer = null;
                return container;
            })
            .catch((ex) => {
                this._assetContainer = null;
                throw ex;
            });
    }

    private async _parseSolid(meshesNames: any, scene: BABYLON.Scene, data: string, rootUrl: string): Promise<Array<BABYLON.AbstractMesh>> {
      let fileToLoad: string = "";
      const materialToUse = new Array<string>();
      const babylonMeshesArray: Array<BABYLON.Mesh> = []; //The mesh for babylon

      var loader = new COLLADA.Loader.ColladaLoader();
      var loaderlog = new COLLADA.LogCallback;
      loaderlog.onmessage = (message: string, level: COLLADA.LogLevel) => { console.log(message); }      
      loader.log = new COLLADA.LogFilter(loaderlog, COLLADA.LogLevel.Debug);
      
      var parser = new DOMParser();
      var meshdata = await readFile(fileToLoad).toString();
      var colladaXml = parser.parseFromString(meshdata, "text/xml");

      var colladaDoc = loader.loadFromXML("id", colladaXml);


      //Return an array with all Mesh
        return babylonMeshesArray;
  }    
}

if (BABYLON.SceneLoader) {
  //Add this loader into the register plugin
  BABYLON.SceneLoader.RegisterPlugin(new DAEFileLoader());
}