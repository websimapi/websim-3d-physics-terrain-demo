// Configuration settings for the 3D scene

export default {
    // Terrain settings
    terrain: {
        size: 1000,
        segments: 128,
        amplitude: 30,
        chunkSize: 200,
        loadDistance: 600,
        noiseScale: 0.03,
        noiseOctaves: 4
    },
    
    // Physics settings
    physics: {
        gravity: -9.82,
        timeStep: 1/60,
        maxSubSteps: 3,
        ballRadius: 5,
        ballMass: 5
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

