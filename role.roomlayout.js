
// role.roomlayout.js
module.exports = {
    getRoomLayout: function(roomName) {
        const room = Game.rooms[roomName];

        // Handle case where the room is not visible or not accessible
        if (!room) {
            console.error(`Room ${roomName} is not visible or accessible.`);
            return;
        }

        const terrain = Game.map.getRoomTerrain(roomName);
        let output = "";

        // Define the dimensions based on your layout (0,0 to 49,49)
        const startX = 0;
        const endX = 49;
        const startY = 0;
        const endY = 49;

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const terrainType =
                    terrain.get(x, y) === TERRAIN_MASK_WALL
                        ? "W"
                        : terrain.get(x, y) === TERRAIN_MASK_SWAMP
                        ? "S"
                        : "P";

                let display = terrainType;
                const objectsAtPos = room.lookAt(x, y);

                for (const object of objectsAtPos) {
                    if (object.type === LOOK_STRUCTURES) {
                        display = object.structure.structureType[0].toUpperCase();
                        break;
                    } else if (object.type === LOOK_CREEPS) {
                        display = "C";
                        break;
                    } else if (object.type === LOOK_SOURCES) {
                        display = "S";
                        break;
                    } else if (object.type === LOOK_MINERALS) {
                        // Use the first letter of the mineral's shorthand
                        display = object.mineral.mineralType[0].toUpperCase();
                        break;
                    } else if (object.type === LOOK_FLAGS) {
                        display = "F";
                        break;
                    } else if (object.type === LOOK_CONSTRUCTION_SITES) {
                        display = "B";
                        break;
                    }
                }

                output += display + " ";
            }
            output += "\n"; // New line for each row
        }

        console.log(output);
    },
};
