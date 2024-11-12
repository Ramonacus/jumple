# jumple

Install dependencies and run `npm run dev` to start the development server.

## Generate a room with Tiled

- Download and open [Tiled](https://www.mapeditor.org/) map editor.
- Click on 'New Map' and configure a new tilemap with this configuration:

  - Orientation: Orthogonal
  - Tile layer format: CSV
  - Tile render order: Left Up
  - Map size:
    - Fixed
    - Width: 45 tiles
    - Height: 60 tiles
  - Tile size:
    - Width: 8px
    - Height: 8px

- Inside the 'Tilesets' tool click on 'New Tileset...' and select the tileset `assets/maps/tileset.png` as the source. Save the `.tsj` locally on your PC.
- Click on the `Embed Tileset` icon.

- Change the layer name to `platforms`.
- Draw the level in the canvas.
- When you are done, save the tilemap inside `assets/maps/` as a JSON file.
