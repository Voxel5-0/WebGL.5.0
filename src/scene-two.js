var SCENE_TWO = 2;

var scene2_skybox_images = [
                            "src/resources/textures/skybox/Scene2/px.png",
                            "src/resources/textures/skybox/Scene2/nx.png",
                            "src/resources/textures/skybox/Scene2/py.png",
                            "src/resources/textures/skybox/Scene2/ny.png",
                            "src/resources/textures/skybox/Scene2/pz.png",
                            "src/resources/textures/skybox/Scene2/nz.png"
                            ];

function InitializeSceneTwo() {
  var scene_two_height_map_image = "src/resources/textures/falt_terrain.png";
  var scene_two_blend_map = "src/resources/textures/BlendMap2.png";
  var scene_two_rock_1_image = "src/resources/textures/rock.png";
  var scene_two_rock_2_image = "src/resources/textures/rock.jpg";
  var scene_two_path_image = "src/resources/textures/muddySoilTexture.jpg";
  var scene_two_grass_image = "src/resources/textures/freshGrassTexture.jpg";

  InitializeHeightMapTerrain(scene_two_height_map_image, scene_two_blend_map, scene_two_rock_1_image,
    scene_two_rock_2_image, scene_two_path_image, scene_two_grass_image, SCENE_TWO);

  LoadSkyboxTextures(scene2_skybox_images, SCENE_TWO);
}

function RenderSceneTwo() {
  var view_matrix = GetCameraViewMatrix();

  DrawSkybox(SCENE_TWO);

  /* Render Terrain */
  if (terrain_data[SCENE_TWO]) {
    RenderTerrain(terrain_data[SCENE_TWO], SCENE_TWO);
  }

  var view_matrix = GetCameraViewMatrix();

  gl.useProgram(null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function UpdateSceneTwo() {

}

function UninitializeSceneTwo() {

}
