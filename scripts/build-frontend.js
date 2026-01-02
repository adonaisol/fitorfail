/**
 * Frontend build script
 * Uses Vite for production build (keeps Tailwind/PostCSS integration)
 * Then copies output to dist/frontend
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { cp, mkdir, rm } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const frontendDir = join(rootDir, 'frontend');
const outDir = join(rootDir, 'dist', 'frontend');

// Run a command and return a promise
function runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd,
            stdio: 'inherit',
            shell: true,
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        child.on('error', reject);
    });
}

// Copy directory recursively
async function copyDir(src, dest) {
    await mkdir(dest, { recursive: true });
    await cp(src, dest, { recursive: true });
}

async function build() {
    console.log('🔧 Building frontend with Vite...');

    // Run Vite build in frontend directory
    // This handles TypeScript, React, Tailwind CSS, and asset optimization
    await runCommand('npm', ['run', 'build'], frontendDir);

    console.log('📁 Copying build output to dist/frontend...');

    // Create output directory
    await mkdir(outDir, { recursive: true });

    // Copy Vite build output to dist/frontend
    const viteBuildDir = join(frontendDir, 'dist');
    await copyDir(viteBuildDir, outDir);

    // Clean up frontend/dist to avoid confusion
    await rm(viteBuildDir, { recursive: true, force: true });

    console.log('✅ Frontend build complete!');
}

build().catch((err) => {
    console.error('❌ Frontend build failed:', err);
    process.exit(1);
});
