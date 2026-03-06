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
    - Width: 24 tiles
    - Height: 24 tiles
  - Tile size:
    - Width: 16px
    - Height: 16px

- Inside the 'Tilesets' tool click on 'New Tileset...' and select the tileset `assets/maps/tileset.png` as the source. Save the `.tsj` in `assets/maps/tileset.png`.
- We need to modify the export options in order to embed the objects used into the final JSON. Click on `Edit` > `Preferences` and check `Detach templates` and `Resolve object types and properties`

- Draw the level in the canvas.
- When you are done, export the tilemap inside `assets/rooms/[ROOM_TYPE]` as a JSON file. **Important** Not saving with Ctrl + S, use `File` > `Export As` or `Ctrl + E`.

- Room objects, found in `public/assets/object-templates` can be added to an "Object Layer" called **Objects** (see the start room example)
- Obstacles must be placed in another "Object Layer" called **Obstacles**
