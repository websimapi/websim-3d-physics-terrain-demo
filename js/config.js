// Configuration settings for the 3D scene

export default {
    // Terrain settings
    terrain: {
        size: 1000,
        segments: 256, // Increased from 128 for smoother terrain
        amplitude: 20, // Reduced from 30 for smoother hills
        chunkSize: 200,
        loadDistance: 600,
        noiseScale: 0.02, // Reduced from 0.03 for smoother, more gradual hills
        noiseOctaves: 5  // Increased from 4 for more detail while keeping smoothness
    },
    
    // Physics settings
    physics: {
        gravity: -20, // Increased from -9.82 for stronger gravity
        timeStep: 1/60,
        maxSubSteps: 3,
        ballRadius: 5,
        ballMass: 15  // Increased from 5 for more weight
    },
    
    // Controls
    controls: {
        ballSpeed: 20,
        cameraSpeed: 1,
        cameraHeight: 80,
        cameraDistance: 100
    },
    
    // Render settings
    render: {
        fogNear: 200,
        fogFar: 800,
        shadowMapSize: 2048
    }
};