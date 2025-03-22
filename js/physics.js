import * as CANNON from 'cannon-es';
import config from './config.js';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, config.physics.gravity, 0)
        });
        
        // Set solver iterations for more stable physics
        this.world.solver.iterations = 20; // Increased from 10 for better stability
        
        // Set up collision detection
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        
        // Improve performance
        this.world.allowSleep = true;

        // Add default contact material for better overall physics behavior
        const defaultMaterial = new CANNON.Material('default');
        const defaultContactMaterial = new CANNON.ContactMaterial(
            defaultMaterial,
            defaultMaterial,
            {
                friction: 0.3,
                restitution: 0.2,
                contactEquationStiffness: 1e6,
                contactEquationRelaxation: 3
            }
        );
        this.world.defaultContactMaterial = defaultContactMaterial;
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
                friction: 0.5,
                restitution: 0.3
            })
        });
        
        this.world.addBody(body);
        return body;
    }
    
    removeBody(body) {
        this.world.removeBody(body);
    }
}