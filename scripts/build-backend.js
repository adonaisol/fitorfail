/**
 * Backend build script
 * Uses esbuild to bundle the Express server
 */

import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { cp, mkdir, readdir, stat } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const backendDir = join(rootDir, 'backend');
const outDir = join(rootDir, 'dist', 'backend');

// Copy directory recursively
async function copyDir(src, dest) {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await cp(srcPath, destPath);
        }
    }
}

async function build() {
    console.log('🔧 Building backend with esbuild...');

    // Create output directory
    await mkdir(outDir, { recursive: true });

    // Bundle the server
    await esbuild.build({
        entryPoints: [join(backendDir, 'src', 'server.ts')],
        bundle: true,
        platform: 'node',
        target: 'node18',
        format: 'cjs', // CommonJS for compatibility with Express and other packages
        outfile: join(outDir, 'server.cjs'),
        // External packages that shouldn't be bundled
        external: [
            // Native modules that need to be installed separately
            'bcrypt',
            // sql.js loads WASM file dynamically
            'sql.js',
        ],
        sourcemap: true,
        minify: false, // Keep readable for debugging
        // In CJS, import.meta.url isn't available, but __filename is
        // This define tricks esbuild into handling it properly
        define: {
            'import.meta.url': '__import_meta_url__',
        },
        banner: {
            js: `const __import_meta_url__ = require('url').pathToFileURL(__filename).href;`,
        },
    });

    console.log('📁 Copying database files...');

    // Copy database migrations
    const migrationsDir = join(backendDir, 'database', 'migrations');
    try {
        await stat(migrationsDir);
        await copyDir(migrationsDir, join(outDir, 'database', 'migrations'));
    } catch (e) {
        console.log('⚠️  No migrations directory found, skipping...');
    }

    // Copy seeds directory (for seed scripts if needed)
    const seedsDir = join(backendDir, 'database', 'seeds');
    try {
        await stat(seedsDir);
        await copyDir(seedsDir, join(outDir, 'database', 'seeds'));
    } catch (e) {
        console.log('⚠️  No seeds directory found, skipping...');
    }

    // Copy dataset directory to dist
    const datasetDir = join(rootDir, 'dataset');
    try {
        await stat(datasetDir);
        await copyDir(datasetDir, join(rootDir, 'dist', 'dataset'));
        console.log('📁 Copied dataset directory');
    } catch (e) {
        console.log('⚠️  No dataset directory found, skipping...');
    }

    // Create a package.json for the dist folder with external dependencies
    console.log('📦 Creating production package.json...');
    const distPackageJson = {
        name: 'fitorfail-production',
        version: '1.0.0',
        private: true,
        scripts: {
            start: 'node backend/server.cjs',
        },
        dependencies: {
            'sql.js': '^1.10.0',
            'bcrypt': '^5.1.1',
        },
    };

    const { writeFile } = await import('fs/promises');
    await writeFile(
        join(rootDir, 'dist', 'package.json'),
        JSON.stringify(distPackageJson, null, 2)
    );

    console.log('✅ Backend build complete!');
}

build().catch((err) => {
    console.error('❌ Backend build failed:', err);
    process.exit(1);
});
