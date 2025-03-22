import * as CANNON from 'cannon-es';
import config from './config.js';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, config.physics.gravity, 0)
        });
        
        // Set solver iterations for more stable physics
        this.world.solver.iterations = 10;
        
        // Set up collision detection
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        
        // Improve performance
        this.world.allowSleep = true;
    }
    
    update(deltaTime) {
        this.world.step(
            config.physics.timeStep,
            deltaTime,
            config.physics.maxSubSteps
        );
    }
    
    createTerrainBody(vertices, indices) {
        // Create a trimesh shape from the terrain vertices
        const shape = new CANNON.Trimesh(vertices, indices);
        
        // Create a static body (mass = 0)
        const body = new CANNON.Body({
            mass: 0,
            shape: shape,
            material: new CANNON.Material({
                friction: 0.6,     // Increased from 0.5 for more grip
                restitution: 0.1   // Decreased from 0.3 for less bounce
            })
        });
        
        this.world.addBody(body);
        return body;
    }
    
    removeBody(body) {
        this.world.removeBody(body);
    }
}