import * as BABYLON from 'babylonjs';
import * as Materials from 'babylonjs-materials';

import { DAEFileLoader } from './daeFileLoader';

export class TestMain {
  public engine: BABYLON.Engine;
  public scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;
  private ground: BABYLON.Mesh;
  private uri: string;

  private transform: BABYLON.TransformNode | undefined;
  private meshes: BABYLON.AbstractMesh[] = [];
  private skeletons: BABYLON.Skeleton[] = [];
  private material: BABYLON.Material | undefined


  public constructor(uri: string) {
    this.uri = uri;
  }

  private meshCallback(scene: BABYLON.Scene, meshes : BABYLON.AbstractMesh[], particleSystems : BABYLON.IParticleSystem[] | undefined, skeletons : BABYLON.Skeleton[] | undefined) {
    // Get a pointer to the mesh
    if (meshes.length > 0 && this.transform != undefined) {
      //this.transform.scaling = new BABYLON.Vector3(-.01, .01, .01);

      this.meshes = this.meshes.concat(meshes);

        // find the top level bone in skeletons
        if (skeletons != undefined && skeletons.length > 0) {
          this.skeletons = skeletons;

          let rootBone = skeletons[0].bones.find(b => b.getParent() == undefined);
          if (rootBone != undefined) {
            //rootBone.getTransformNode().paren t = this.transform;
            rootBone.returnToRest();
          }
        }
        this.meshes.forEach(m => {
            if (this.transform != undefined) {
                //m.addRotation(0, 0, Math.PI).addRotation(Math.PI/2, 0, 0);
                // Invert the left handed mesh to conform to the right handed coodinate system
                //m.parent = this.transform;
                //m.scaling = new BABYLON.Vector3(-.01, .01, .01);
                
                if (this.material != undefined && this.material != undefined) {
                    m.material = this.material;
                }
            }

            var normals = this.showNormals(m, .1, BABYLON.Color3.Red(), this.scene);
            if (normals != undefined) {
              normals.parent = m;
            }

            //var v = this.showVerticies(m, .01, BABYLON.Color3.Red());
            //if (v != undefined) {
              //v.parent = this.transform;
            //}
        });

    }

}

showVerticies(mesh: BABYLON.AbstractMesh, size: number, color: BABYLON.Color3) : BABYLON.Mesh {
  var positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  if (!positions) {
    console.info(mesh.name + " has no positions");
    return;
  }

  color = color || BABYLON.Color3.White();
  size = size || 1;

  var SPS = new BABYLON.SolidParticleSystem("SPS", this.scene);
  var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: size}, this.scene);

  SPS.addShape(sphere, positions.length / 3);      // sphere per vertex
  sphere.dispose();

  var spsMesh = SPS.buildMesh();

  var initParticle = function(particle: BABYLON.SolidParticle) : BABYLON.SolidParticle {
      particle.position.x = positions[3 * particle.idx];
      particle.position.y = positions[3 * particle.idx + 1];
      particle.position.z = positions[3 * particle.idx + 2];

      return particle;
  }

  // init particles
  SPS.updateParticle = initParticle;
  SPS.setParticles(); 
  SPS.billboard = true;
  SPS.isAlwaysVisible = true;
  SPS.refreshVisibleSize();

  this.scene.registerBeforeRender(function() {
      SPS.setParticles();
  })

  return spsMesh
}

showNormals(mesh, size, color, sc) : BABYLON.LinesMesh{
  var normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
  var positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);

  if (!normals || !positions) {
    console.info(mesh.name + " has no normals or positions");
    return;
  }

  console.info("****" + mesh.name + " Normals: " + normals.length);
  console.info("****" + mesh.name + " Positions: " + positions.length);

  color = color || BABYLON.Color3.White();
  sc = sc || this.scene;
  size = size || 1;

  var colors = [];

  var lines = [];
  for (let i = 0; i < normals.length; i += 3) {
    var v1 = BABYLON.Vector3.FromArray(positions, i);
    var v2 = v1.add(BABYLON.Vector3.FromArray(normals, i).scaleInPlace(size));
    lines.push([v1.add(mesh.position), v2.add(mesh.position)]);
    colors.push([new BABYLON.Color4(color.r, color.g, color.b, 1), new BABYLON.Color4(0, 0, color.b, 1)]);
  }
  var normalLines = BABYLON.MeshBuilder.CreateLineSystem("normalLines", { lines: lines, colors: colors }, sc, );
  return normalLines;
}

  public createScene() {
    const canvas = document.getElementById("renderCanvas");
    const canvasElement = canvas as unknown as HTMLCanvasElement;

    let e: any = new BABYLON.Engine(canvasElement, true); // Generate the BABYLON 3D engine
    this.engine = e;

    this.scene = new BABYLON.Scene(e);
    if (BABYLON.SceneLoader) {
      //Add this loader into the register plugin
      BABYLON.SceneLoader.RegisterPlugin(new DAEFileLoader());
    }

    this.transform = new BABYLON.TransformNode("rootModel", this.scene);


    // This creates a basic Babylon Scene object (non-mesh)
      // Create a default ground and skybox.
    const environment = this.scene.createDefaultEnvironment({
      createGround: true,
      createSkybox: false,
      enableGroundMirror: true,
      groundMirrorSizeRatio: 0.15
    });

    //this.scene.useRightHandedSystem = true;
    this.scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.Gray());

    this.scene.debugLayer.show();
    
    // This creates and positions a free camera (non-mesh)
    this.camera = new BABYLON.ArcRotateCamera("camera1", - 3 * Math.PI / 3, 50 * Math.PI / 12, 1, new BABYLON.Vector3(0, 0, 0), this.scene);
    this.camera.wheelDeltaPercentage = 0.01;
    this.camera.minZ = 0.1;

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
    const light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(1, 0, 0), this.scene);
    const light3 = new BABYLON.HemisphericLight("light3", new BABYLON.Vector3(0, 0, 1), this.scene);

    // This attaches the camera to the canvas
    this.camera.attachControl(canvas, true);

    var groundMaterial = new Materials.GridMaterial("groundMaterial", this.scene);
    groundMaterial.majorUnitFrequency = 5;
    groundMaterial.minorUnitVisibility = 0.5;
    groundMaterial.gridRatio = 1;
    groundMaterial.opacity = 0.8;
    groundMaterial.useMaxLine = true;
    groundMaterial.lineColor = BABYLON.Color3.Green();
    groundMaterial.mainColor = BABYLON.Color3.Green();

    this.ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 50, height: 50}, this.scene);
    this.ground.material = groundMaterial;
    this.ground.isPickable = false;  

    let filename = this.uri.substring(this.uri.lastIndexOf('/') + 1);
    if (filename) {
        let base = this.uri.substring(0, this.uri.lastIndexOf('/') + 1);
        BABYLON.SceneLoader.ImportMesh(null, base, filename, this.scene, (mesh, ps, sk) => {this.meshCallback(this.scene, mesh, ps, sk)});
    }
  }
}

let test : TestMain | undefined = undefined;

export async function RenderTestMain() {

  if (test === undefined) {
    test = new TestMain("https://raw.githubusercontent.com/LeoRover/leo_common-ros2/humble/leo_description/models/Chassis.dae");
    //test = new TestMain("https://raw.githubusercontent.com/assimp/assimp/refs/heads/master/test/models/Collada/cube_triangulate.dae");
    //test = new TestMain("https://raw.githubusercontent.com/LeoRover/leo_common-ros2/humble/leo_description/models/Rocker.dae");
    
    test.createScene();
    test.engine.runRenderLoop(() => {
      test.scene.render();
    });

    // Resize
    window.addEventListener("resize", () => {
      test.engine.resize();
    });
  }
}

