var roles = {
    harvester: {
        module: require('role.harvester'),
        desired: 2,
        body: [WORK, CARRY, MOVE],
        priority: 1
    },
    builder: {
        module: require('role.builder'),
        desired: 2,
        body: [WORK, CARRY, MOVE],
        priority: 2
    },
    upgrader: {
        module: require('role.upgrader'),
        desired: 2,
        body: [WORK, CARRY, MOVE],
        priority: 3
    }
};

var roleTower = require('role.tower');

module.exports.loop = function () {
    
    // Clear Dead Creeps from Memory
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    // Run tower code
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    for(let tower of towers) {
        roleTower.run(tower);
    }

    // Automated Spawning Logic
    for(let roleName in roles) {
        let role = roles[roleName];
        let creepsInRole = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);

        if(creepsInRole.length < role.desired) {
            spawnCreep(role.body, roleName);
            // Remove the break statement to allow for multiple spawns per tick if needed
        }
    }

    // Optimize Role Running
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        let role = roles[creep.memory.role];
        if(role && role.module) {
            role.module.run(creep);
        } else {
            console.error(`Unknown role for creep ${name}.`);
        }
    }
}

function spawnCreep(body, role) {
    // Try to get the first spawn in the room
    var spawns = _.filter(Game.spawns);
    if(spawns.length) {
        var spawn = spawns[0];
        var creepName = `${role}_${Game.time}`;
        if(spawn.spawnCreep(body, creepName, { dryRun: true }) == OK) { // Check if spawn is possible
            spawn.spawnCreep(body, creepName, { memory: { role: role } });
            console.log(`Spawning new ${role}: ${creepName}`);
        }
    } else {
        console.log('Error: No spawns found in this room!');
    }
}
