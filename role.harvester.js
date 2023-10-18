
// role.Role harvester.js
function findTargetForTransfer(creep) {
    // Define your logic here to find a target for resource transfer
    // For example, you can find structures that need energy or utrium
    // and return the target structure.
    // Make sure to handle cases where no target is found and return null.
}

function moveToFallback(creep) {
    // Define your logic here to determine the fallback location
    // where the creep should move when no transfer target is available.
    // For example, you can move the creep to a specific flag or location.
}

module.exports = {
    run: function(creep) {
        try {
            // Ensure 'working' state is initialized
            if (typeof creep.memory.working === 'undefined') {
                creep.memory.working = false;
            }

            // Check if the harvester is already full of energy
            if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
                creep.memory.working = true;
                delete creep.memory.sourceId;
                delete creep.memory.targetId;
            } else if (creep.memory.working && (creep.store[RESOURCE_ENERGY] == 0 && creep.store[RESOURCE_UTRIUM] == 0 || creep.store.getFreeCapacity() <= 50)) {
                creep.memory.working = false;
                delete creep.memory.targetId;
            }

            if (!creep.memory.working) {
                // Check for ruins in the room only if the harvester is not full
                var ruins = creep.room.find(FIND_RUINS, {
                    filter: (ruin) => {
                        return ruin.store.getUsedCapacity(RESOURCE_ENERGY) > 0 || ruin.store.getUsedCapacity(RESOURCE_UTRIUM) > 0;
                    }
                });

                if (ruins.length > 0) {
                    // Move to the nearest ruin and collect resources with yellow path
                    if (creep.withdraw(ruins[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE || creep.withdraw(ruins[0], RESOURCE_UTRIUM) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(ruins[0], { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 50 });
                    }
                } else {
                    // If no ruins, proceed with the normal harvesting behavior
                    var source = Game.getObjectById(creep.memory.sourceId);

                    // If no source or it's exhausted, clear memory and find a new one
                    if (!source || (source.energy == 0 && source.mineralAmount == 0)) {
                        delete creep.memory.sourceId;
                        source = creep.pos.findClosestByPath([FIND_SOURCES_ACTIVE, FIND_MINERALS]);
                    }

                    // Set the found source in memory
                    if (source) {
                        creep.memory.sourceId = source.id;
                    } else {
                        console.log(`Harvester ${creep.name} cannot find an accessible source. Check for obstructions or empty sources.`);
                        return; // No accessible source, exit early
                    }

                    // Attempt to harvest, if not in range, move to source with yellow path
                    if (source.resourceType === RESOURCE_ENERGY) {
                        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 50 });
                        }
                    } else {
                        // Harvest minerals
                        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 50 });
                        }
                    }
                }
            } else {
                // Handle resource transfer to various structures
                var target = Game.getObjectById(creep.memory.targetId) || findTargetForTransfer(creep);

                if (target) {
                    creep.memory.targetId = target.id;

                    // Transfer resources with white path
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE || creep.transfer(target, RESOURCE_UTRIUM) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' }, reusePath: 50 });
                    }
                } else {
                    // Move to fallback location with white path
                    moveToFallback(creep);
                }
            }
        } catch (error) {
            console.log(`Error in harvester role for creep ${creep.name}: ${error}`);
        }
    }
};
