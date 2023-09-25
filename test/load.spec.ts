import * as BABYLON from "babylonjs";
import path from 'path';
import { readFileSync } from 'fs';
import * as Loader from "../src/loader"
import {RMXModelLoader} from "../src/model-loader"
import * as BabylonLoader from "../src/babylon-loader"
import {RMXModel} from "../src/model"
import { ColladaConverter } from '../src/converter/colladaconverter';
import { ColladaExporter } from '../src/exporter/colladaexporter';
import { DAEFileLoader } from '../src/daeFileLoader';
let engine = undefined;
let scene : BABYLON.Scene | undefined = undefined;

beforeAll(() => {
    // Needed for testing material loading
    engine = new BABYLON.NullEngine();
    scene = new BABYLON.Scene(engine);

});

afterAll(() => {
    scene = undefined
    engine = undefined;
});


describe("Testing Dae", () => {
  test('Test Parsing XML', () => {
    if (BABYLON.SceneLoader) {
      //Add this loader into the register plugin
      BABYLON.SceneLoader.RegisterPlugin(new DAEFileLoader());
    }

    var filePath = path.join(__dirname, "testdata/leo.dae");
    var meshdata = readFileSync(filePath).toString('base64');
      BABYLON.SceneLoader.ImportMesh(null, "", "data:;base64," + meshdata, scene, (mesh) => {
        expect(mesh).toBeDefined();
    }, null, null, ".dae");

  })
})
