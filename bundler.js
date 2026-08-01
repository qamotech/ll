/**
 * @fileoverview Utility to bundle local codebase files into an AI-readable XML format.
 */

const fs = require('fs').promises;
const path = require('path');

// Default files/directories to ignore if .aiignore is missing
const DEFAULT_IGNORES = new Set(['.git', 'node_modules', 'package-lock.json', '.aiignore']);

/**
 * Loads the .aiignore file and merges it with default ignores.
 * @returns {Promise<Set<string>>} Set of ignored filenames/directories.
 */
async function loadIgnores() {
    const ignores = new Set(DEFAULT_IGNORES);
    try {
        const aiignore = await fs.readFile('.aiignore', 'utf-8');
        aiignore.split('\n').forEach(line => {
            const cleanLine = line.trim().replace(/\/$/, ''); // Remove trailing slashes
            if (cleanLine && !cleanLine.startsWith('#')) {
                ignores.add(cleanLine);
            }
        });
    } catch (e) {
        // .aiignore not found, proceed with defaults
    }
    return ignores;
}

/**
 * Recursively reads the directory and bundles file contents into XML.
 * @param {string} dir - The directory to bundle.
 * @returns {Promise<string>} The bundled XML string.
 */
async function bundleContext(dir = './') {
    const ignores = await loadIgnores();
    let xmlOutput = `<codebase>\n`;

    async function traverse(currentPath) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            if (ignores.has(entry.name)) continue;

            const fullPath = path.join(currentPath, entry.name);

            if (entry.isDirectory()) {
                await traverse(fullPath);
            } else if (entry.isFile()) {
                try {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    // Token optimization: replace multiple blank lines with a single newline
                    const optimizedContent = content.replace(/\n\s*\n/g, '\n\n');
                    
                    xmlOutput += `<file path="${fullPath}">\n<![CDATA[\n${optimizedContent}\n]]>\n</file>\n`;
                } catch (err) {
                    // Skip unreadable or binary files silently
                }
            }
        }
    }

    await traverse(dir);
    xmlOutput += `</codebase>`;
    return xmlOutput;
}

module.exports = { bundleContext };