import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import config from './config.js';

export class TerrainManager {
    constructor(scene, physicsWorld, playerPosition) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.playerPosition = playerPosition;
        
        // Initialize noise
        this.noise = createNoise2D();
        
        // Active chunks tracking
        this.chunks = new Map();
        this.loadedChunks = [];
        
        // Create materials for the terrain
        this.material = new THREE.MeshStandardMaterial({
            color: 0x5d8a68,
            flatShading: true,
            vertexColors: true
        });
        
        // Initial chunk creation around player
        this.updateChunks();
    }
    
    update(playerPosition) {
        this.playerPosition = playerPosition;
        this.updateChunks();
    }
    
    updateChunks() {
        // Get player position
        const px = Math.floor(this.playerPosition.x / config.terrain.chunkSize);
        const pz = Math.floor(this.playerPosition.z / config.terrain.chunkSize);
        
        // Maximum distance for chunks in grid units
        const loadDistance = Math.ceil(config.terrain.loadDistance / config.terrain.chunkSize);
        
        // Keep track of chunks we've processed this frame
        const chunksToKeep = new Set();
        
        // Check which chunks need to be created or retained
        for (let x = px - loadDistance; x <= px + loadDistance; x++) {
            for (let z = pz - loadDistance; z <= pz + loadDistance; z++) {
                const key = `${x},${z}`;
                const distance = Math.sqrt((x - px) ** 2 + (z - pz) ** 2) * config.terrain.chunkSize;
                
                if (distance <= config.terrain.loadDistance) {
                    chunksToKeep.add(key);
                    
                    // Create chunk if it doesn't exist
                    if (!this.chunks.has(key)) {
                        this.createChunk(x, z);
                    }
                }
            }
        }
        
        // Remove chunks that are too far away
        for (const [key, chunk] of this.chunks.entries()) {
            if (!chunksToKeep.has(key)) {
                this.removeChunk(key, chunk);
            }
        }
    }
    
    createChunk(x, z) {
        const chunkSize = config.terrain.chunkSize;
        const segments = Math.floor(config.terrain.segments * (chunkSize / config.terrain.size));
        
        // Generate terrain geometry
        const geometry = new THREE.PlaneGeometry(
            chunkSize,
            chunkSize,
            segments,
            segments
        );
        geometry.rotateX(-Math.PI / 2); // Make it horizontal
        
        // Offset vertices to chunk position
        const positionAttr = geometry.attributes.position;
        const vertices = [];
        const colors = [];
        
        // Apply noise to each vertex and collect vertices for physics
        for (let i = 0; i < positionAttr.count; i++) {
            const x3 = positionAttr.getX(i) + x * chunkSize;
            const z3 = positionAttr.getZ(i) + z * chunkSize;
            
            // Apply multiple octaves of noise for more detailed terrain
            let elevation = 0;
            let amplitude = config.terrain.amplitude;
            let frequency = config.terrain.noiseScale;
            let weight = 1.0;
            let weightSum = 0;
            
            for (let o = 0; o < config.terrain.noiseOctaves; o++) {
                // Use weighted noise for smoother blending between octaves
                elevation += this.noise(x3 * frequency, z3 * frequency) * amplitude * weight;
                weightSum += weight;
                amplitude *= 0.5;
                frequency *= 2;
                weight *= 0.75;
            }
            
            // Normalize based on weight sum
            elevation /= weightSum;
            
            // Apply smoothing function for more rounded terrain
            elevation = Math.pow(Math.abs(elevation), 0.8) * Math.sign(elevation);
            
            // Set the new Y position
            positionAttr.setY(i, elevation);
            
            // Store vertices for physics
            vertices.push(positionAttr.getX(i), elevation, positionAttr.getZ(i));
            
            // Set vertex color based on height
            const normalizedHeight = (elevation + config.terrain.amplitude) / (config.terrain.amplitude * 2);
            
            // Snow above certain height
            if (normalizedHeight > 0.8) {
                colors.push(0.95, 0.95, 0.95);
            } 
            // Rock near top
            else if (normalizedHeight > 0.6) {
                colors.push(0.5, 0.5, 0.5);
            }
            // Grass for medium heights
            else if (normalizedHeight > 0.3) {
                colors.push(0.33, 0.54, 0.4);
            }
            // Sand/dirt for lower areas
            else {
                colors.push(0.76, 0.7, 0.5);
            }
        }
        
        // Update geometry
        geometry.computeVertexNormals();
        
        // Add vertex colors
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        // Create visual mesh
        const mesh = new THREE.Mesh(geometry, this.material);
        mesh.receiveShadow = true;
        mesh.position.set(x * chunkSize, 0, z * chunkSize);
        this.scene.add(mesh);
        
        // Create physics body
        const indices = [];
        for (let i = 0; i < geometry.index.count; i++) {
            indices.push(geometry.index.array[i]);
        }
        
        const physicsBody = this.physicsWorld.createTerrainBody(vertices, indices);
        physicsBody.position.set(x * chunkSize, 0, z * chunkSize);
        
        // Store chunk data
        this.chunks.set(`${x},${z}`, { mesh, physicsBody });
    }
    
    removeChunk(key, chunk) {
        // Remove from scene
        this.scene.remove(chunk.mesh);
        
        // Remove physics body
        this.physicsWorld.removeBody(chunk.physicsBody);
        
        // Dispose geometry
        chunk.mesh.geometry.dispose();
        
        // Remove from tracking
        this.chunks.delete(key);
    }
}