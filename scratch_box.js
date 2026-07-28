const fs = require('fs');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const THREE = require('three');
// We need jsdom or similar to run GLTFLoader in node, or we can just parse the GLB manually.
// Actually, let's just write a Next.js API route temporarily to log the bounds, or parse the glb min/max from accessors.
