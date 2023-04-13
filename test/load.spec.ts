import path from 'path';
import { readFileSync } from 'fs';
import * as Loader from "../src/loader"
import * as Converter from "../src/converter/converter"
import * as Exporter from "../src/exporter/exporter"
import {RMXModelLoader} from "../src/model-loader"
import * as BabylonLoader from "../src/babylon-loader"
import {RMXModel} from "../src/model"

describe("Testing Dae", () => {
  test('Test Parsing XML', () => {
    var parser = new DOMParser();
    var loader = new Loader.ColladaLoader();

    var filePath = path.join(__dirname, "testdata/monkey.dae");
    var meshdata = readFileSync(filePath).toString();

    var colladaXml = parser.parseFromString(meshdata, "text/xml");

    var colladaDoc = loader.loadFromXML("id", colladaXml);
    expect(colladaDoc).toBeDefined();

    var converter = new Converter.ColladaConverter();
    var convertedDoc = converter.convert(colladaDoc);

    var exporter = new Exporter.ColladaExporter();
    var exportedDoc = exporter.export(convertedDoc);

    var modelLoader = new RMXModelLoader;
    var model: RMXModel = modelLoader.loadModel(exportedDoc.json, exportedDoc.data.buffer);

  })
})
