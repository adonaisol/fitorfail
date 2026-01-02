/**
 * Main build orchestrator
 * Runs frontend and backend builds in parallel
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { rm, mkdir } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// ANSI color codes for output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function runScript(scriptPath, name) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        log(`\n📦 Starting ${name} build...`, colors.cyan);

        const child = spawn('node', [scriptPath], {
            cwd: rootDir,
            stdio: 'inherit',
        });

        child.on('close', (code) => {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            if (code === 0) {
                log(`✅ ${name} build completed in ${duration}s`, colors.green);
                resolve();
            } else {
                log(`❌ ${name} build failed with code ${code}`, colors.red);
                reject(new Error(`${name} build failed`));
            }
        });

        child.on('error', (err) => {
            log(`❌ ${name} build error: ${err.message}`, colors.red);
            reject(err);
        });
    });
}

async function main() {
    const startTime = Date.now();
    log('\n🚀 FitOrFail Production Build', colors.bright + colors.blue);
    log('='.repeat(40), colors.blue);

    try {
        // Clean dist directory
        log('\n🧹 Cleaning dist directory...', colors.yellow);
        await rm(join(rootDir, 'dist'), { recursive: true, force: true });
        await mkdir(join(rootDir, 'dist'), { recursive: true });

        // Run builds in parallel
        await Promise.all([
            runScript(join(__dirname, 'build-frontend.js'), 'Frontend'),
            runScript(join(__dirname, 'build-backend.js'), 'Backend'),
        ]);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        log('\n' + '='.repeat(40), colors.green);
        log(`🎉 Build completed successfully in ${duration}s!`, colors.bright + colors.green);
        log('\nTo start the production server:', colors.reset);
        log('  npm start', colors.cyan);
        log('', colors.reset);
    } catch (error) {
        log(`\n💥 Build failed: ${error.message}`, colors.red);
        process.exit(1);
    }
}

main();
