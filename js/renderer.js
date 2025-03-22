import * as THREE from 'three';
import config from './config.js';

export class GameRenderer {
    constructor() {
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        this.scene.fog = new THREE.Fog(
            0x87ceeb,
            config.render.fogNear,
            config.render.fogFar
        );
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Set up lights
        this.setupLights();
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(100, 200, 100);
        directionalLight.castShadow = true;
        
        // Shadow settings
        directionalLight.shadow.mapSize.width = config.render.shadowMapSize;
        directionalLight.shadow.mapSize.height = config.render.shadowMapSize;
        directionalLight.shadow.camera.near = 10;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -250;
        directionalLight.shadow.camera.right = 250;
        directionalLight.shadow.camera.top = 250;
        directionalLight.shadow.camera.bottom = -250;
        
        this.scene.add(directionalLight);
    }
    
    setupFollowCamera(targetMesh) {
        this.targetMesh = targetMesh;
        this.cameraOffset = new THREE.Vector3(
            0, 
            config.controls.cameraHeight, 
            config.controls.cameraDistance
        );
        
        // Initial camera position
        this.updateCameraPosition();
    }
    
    updateCameraPosition() {
        if (!this.targetMesh) return;
        
        // Get target position
        const targetPosition = this.targetMesh.position.clone();
        
        // Apply camera offset
        this.camera.position.copy(targetPosition).add(this.cameraOffset);
        
        // Look at target
        this.camera.lookAt(targetPosition);
    }
    
    updateCamera(playerPosition, deltaTime, input) {
        // Rotate camera offset based on WASD input
        if (input.keys.a) {
            this.rotateOffset(deltaTime * config.controls.cameraSpeed);
        }
        if (input.keys.d) {
            this.rotateOffset(-deltaTime * config.controls.cameraSpeed);
        }
        
        this.updateCameraPosition();
    }
    
    rotateOffset(angle) {
        // Rotate camera offset around the Y axis
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const x = this.cameraOffset.x * cos - this.cameraOffset.z * sin;
        const z = this.cameraOffset.x * sin + this.cameraOffset.z * cos;
        
        this.cameraOffset.x = x;
        this.cameraOffset.z = z;
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

