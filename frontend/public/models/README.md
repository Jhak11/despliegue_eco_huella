# Golemino 3D Models

This directory should contain the 3D models for Golemino in GLB format.

## Required Files:
- `golemino_baby.glb` - Baby phase model
- `golemino_young.glb` - Young phase model  
- `golemino_titan.glb` - Titan phase model

## Specifications:
- **Format**: GLB (binary glTF)
- **Size**: < 5MB per model (optimized for web)
- **Animations** (optional but recommended):
  - `idle` - Default animation when healthy
  - `sick` - Animation when health is low
  - `happy` - Animation for interactions

## Temporary Placeholder:
Currently, the application uses a simple cube geometry as a placeholder.
The cube will be colored based on health status:
- Green (80-100%): Healthy
- Yellow (60-79%): Mild sickness
- Orange (40-59%): Moderate sickness
- Red (0-39%): Critical

## How to Add Models:
1. Place your `.glb` files in this directory
2. Ensure they are named exactly as listed above
3. Restart the development server
4. The models will be automatically loaded

## Free 3D Model Resources:
- Sketchfab (https://sketchfab.com) - Many free models
- Poly Pizza (https://poly.pizza) - Free low-poly models
- Quaternius (https://quaternius.com) - Free game-ready models

## Creating Custom Models:
You can create models using:
- Blender (free, open-source)
- Blockbench (great for blocky/voxel style)
- MagicaVoxel (for voxel art)

Export as GLB format for best compatibility.
