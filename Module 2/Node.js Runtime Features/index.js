/**
 * Node.js Runtime Features — Streams, Buffers & the File System
 *
 * GOAL
 * Move the SAME file two different ways and feel the difference:
 *   1) Load the whole file into memory with fs.readFile, and log its size.
 *   2) Flow the file through a stream and pipe it to a writable stream (a copy).
 * Then explain, in your own words, why the stream approach is preferable for
 * large files.
 *
 * The starter already imports `fs` and `path` for you and points at a large
 * sample file (`sample-data.txt`) that lives next to this script.
 *
 * Run it with:  npm start
 */

const fs = require('fs');
const path = require('path');

// Absolute, OS-safe path to the sample file (do NOT hand-build paths with '+').
const INPUT = path.join(__dirname, 'sample-data.txt');
const OUTPUT = path.join(__dirname, 'sample-copy.txt');

// ── PART 1: read the whole file into memory, then log its size ──────────────
function readWholeFile() {
  // fs.readFile with no encoding returns a Buffer (raw bytes).
  // buf.length gives the size in bytes — the whole file is in RAM at once.
  fs.readFile(INPUT, (err, data) => {
    if (err) return console.error('readFile error:', err.message);
    console.log(`readFile: loaded ${data.length} bytes into memory`);
  });
}

// ── PART 2: stream the file and pipe it to a writable stream ────────────────
function streamFile() {
  // Create a readable stream (source) and a writable stream (destination).
  // .pipe() connects them: chunks flow from source → destination automatically.
  // Only one small chunk lives in memory at any moment — peak memory stays flat.
  const read = fs.createReadStream(INPUT);
  const write = fs.createWriteStream(OUTPUT);

  read.pipe(write);

  write.on('finish', () => {
    console.log('stream: finished copying via 64KB chunks (flat memory)');
  });

  read.on('error', (err) => console.error('Read stream error:', err.message));
  write.on('error', (err) => console.error('Write stream error:', err.message));
}

// ── PART 3: explain the difference ──────────────────────────────────────────
// YOUR EXPLANATION:
// fs.readFile loads the entire file into a single Buffer in memory all at once,
// which means peak memory consumption scales directly with the file size.
// In contrast, streams process data chunk-by-chunk (e.g. 64KB at a time),
// keeping peak RAM usage flat and lightweight regardless of how large the file is.

// Run both approaches.
readWholeFile();
streamFile();

module.exports = { readWholeFile, streamFile, INPUT, OUTPUT };
