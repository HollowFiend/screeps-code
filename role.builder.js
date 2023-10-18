
// role.role.builder.js
module.exports = {
    run: function(creep) {
        try {
            if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.building = false;
                creep.say('🔄 harvest');
            }
            if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
                creep.memory.building = true;
                creep.say('🚧 build');
            }

            if (creep.memory.building) {
                // Find construction sites to build
                var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

                if (constructionSite) {
                    if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(constructionSite, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                } else {
                    // No construction sites, repair structures if needed
                    var repairTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 1000
                    });

                    if (repairTarget) {
                        if (creep.repair(repairTarget) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(repairTarget, { visualizePathStyle: { stroke: '#ffaa00' } });
                        }
                    }
                }
            } else {
                // Withdraw energy from storage or containers
                var energySource = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER ||
                                structure.structureType == STRUCTURE_STORAGE) &&
                                structure.store[RESOURCE_ENERGY] > 0;
                    }
                });

                if (energySource) {
                    if (creep.withdraw(energySource, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(energySource, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                } else {
                    // If no energy sources nearby, go harvest from a source
                    var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
            }
        } catch (error) {
            console.log(`Error in builder role for creep ${creep.name}: ${error}`);
        }
    }
};
