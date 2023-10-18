module.exports = {
    run: function(creep) {
        try {
            // Check energy status of the creep
            if (creep.store[RESOURCE_ENERGY] === 0) {
                // Try to withdraw energy from containers or storage if available
                var storageOrContainerWithEnergy = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER ||
                                structure.structureType == STRUCTURE_STORAGE) &&
                                structure.store[RESOURCE_ENERGY] > 0;
                    }
                });

                if (storageOrContainerWithEnergy) {
                    if (creep.withdraw(storageOrContainerWithEnergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storageOrContainerWithEnergy);
                    }
                } else {
                    // If no storage or containers with energy, harvest directly from a source
                    var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                    }
                }
            } else {
                // Upgrade logic
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    // Move closer to the controller
                    var containersNearController = creep.room.controller.pos.findInRange(FIND_STRUCTURES, 3, {
                        filter: { structureType: STRUCTURE_CONTAINER }
                    });

                    if (containersNearController.length) {
                        creep.moveTo(containersNearController[0]);
                    } else {
                        creep.moveTo(creep.room.controller);
                    }
                }
            }

            // Idle Behavior - For now, let's make the upgrader idle near the controller
            if (creep.room.controller.level == creep.room.controller.progressTotal) {
                creep.moveTo(creep.room.controller);
            }
        } catch (error) {
            console.log(`Error in upgrader role for creep ${creep.name}: ${error}`);
        }
    }
};
