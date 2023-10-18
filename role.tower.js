// role.tower.js

module.exports = {
    run: function(tower) {
        
        // 1. Attack hostile creeps first.
        
        // Prioritize healers, as they can prolong an attack significantly
        var hostileHealers = tower.room.find(FIND_HOSTILE_CREEPS, {
            filter: (creep) => creep.getActiveBodyparts(HEAL) > 0
        });

        var target = null;

        if(hostileHealers.length > 0) {
            target = tower.pos.findClosestByRange(hostileHealers);
        } else {
            // Next, target melee and ranged attackers
            var hostileAttackers = tower.room.find(FIND_HOSTILE_CREEPS, {
                filter: (creep) => 
                    creep.getActiveBodyparts(ATTACK) > 0 ||
                    creep.getActiveBodyparts(RANGED_ATTACK) > 0
            });

            if(hostileAttackers.length > 0) {
                target = tower.pos.findClosestByRange(hostileAttackers);
            } else {
                // If no healers or attackers, target any hostile creep
                target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            }
        }

        if(target) {
            tower.attack(target);
            return;  // Exit early since attacking is our top priority
        }

        // 2. Repair structures, but maintain a certain energy level in the tower to ensure it can respond to threats.
        
        if(tower.store[RESOURCE_ENERGY] > 300) {
            // Prioritize non-wall structures first
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => 
                    structure.hits < structure.hitsMax && 
                    structure.structureType != STRUCTURE_WALL && 
                    structure.structureType != STRUCTURE_RAMPART
            });

            if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
                return;
            }

            // Repair walls and ramparts, but only if they're below a certain threshold (e.g., 300,000 hits).
            // This threshold can be adjusted based on your needs.
            var damagedWallsAndRamparts = tower.room.find(FIND_STRUCTURES, {
                filter: (structure) => 
                    (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) &&
                    structure.hits < 300000
            });

            if(damagedWallsAndRamparts.length > 0) {
                // Sort by hits - lowest first - and repair the most damaged one
                var targetWallOrRampart = _.sortBy(damagedWallsAndRamparts, s => s.hits)[0];
                tower.repair(targetWallOrRampart);
            }
        }
    }
};
