import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import config from './config.js';
import { TerrainManager } from './terrain.js';
import { PhysicsWorld } from './physics.js';
import { InputController } from './input.js';
import { GameRenderer } from './renderer.js';

class Game {
    constructor() {
        // Initialize components
        this.renderer = new GameRenderer();
        this.physics = new PhysicsWorld();
        this.input = new InputController();
        
        // Setup game objects
        this.setupPlayer();
        
        // Initialize terrain manager
        this.terrainManager = new TerrainManager(
            this.renderer.scene, 
            this.physics,
            this.playerBody.position
        );
        
        // Start game loop
        this.lastTime = 0;
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }
    
    setupPlayer() {
        // Create player sphere
        const radius = config.physics.ballRadius;
        
        // Create three.js visual representation
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x3498db,
            metalness: 0.3,
            roughness: 0.4
        });
        this.playerMesh = new THREE.Mesh(geometry, material);
        this.playerMesh.castShadow = true;
        this.renderer.scene.add(this.playerMesh);
        
        // Create physics body
        const shape = new CANNON.Sphere(radius);
        this.playerBody = new CANNON.Body({
            mass: config.physics.ballMass,
            shape: shape,
            position: new CANNON.Vec3(0, 100, 0),
            linearDamping: 0.5,
            angularDamping: 0.5
        });
        this.physics.world.addBody(this.playerBody);
        
        // Set up the camera to follow the player
        this.renderer.setupFollowCamera(this.playerMesh);
    }
    
    update(deltaTime) {
        // Update physics
        this.physics.update(deltaTime);
        
        // Update player movement from input
        this.handlePlayerMovement(deltaTime);
        
        // Update visual positions from physics
        this.playerMesh.position.copy(this.playerBody.position);
        this.playerMesh.quaternion.copy(this.playerBody.quaternion);
        
        // Update terrain chunks based on player position
        this.terrainManager.update(this.playerBody.position);
        
        // Update camera
        this.renderer.updateCamera(this.playerBody.position, deltaTime, this.input);
    }
    
    handlePlayerMovement(deltaTime) {
        const force = 
            config.controls.ballSpeed * config.physics.ballMass;
        
        if (this.input.keys.ArrowUp) {
            this.playerBody.applyForce(
                new CANNON.Vec3(0, 0, -force),
                this.playerBody.position
            );
        }
        if (this.input.keys.ArrowDown) {
            this.playerBody.applyForce(
                new CANNON.Vec3(0, 0, force),
                this.playerBody.position
            );
        }
        if (this.input.keys.ArrowLeft) {
            this.playerBody.applyForce(
                new CANNON.Vec3(-force, 0, 0),
                this.playerBody.position
            );
        }
        if (this.input.keys.ArrowRight) {
            this.playerBody.applyForce(
                new CANNON.Vec3(force, 0, 0),
                this.playerBody.position
            );
        }
    }
    
    animate(time) {
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;
        
        this.update(Math.min(deltaTime, 0.1));
        this.renderer.render();
        
        requestAnimationFrame(this.animate);
    }
}

// Initialize the game when the page is loaded
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});