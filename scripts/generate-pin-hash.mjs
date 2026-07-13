#!/usr/bin/env node
// Generate a PBKDF2 pin hash for bootstrapping the first admin user.
// Usage: node scripts/generate-pin-hash.mjs <your-pin>
// Then paste the output into Neon SQL console:
//   INSERT INTO public.users (name, pin_hash, is_admin)
//   VALUES ('YourName', '<output>', true);

import { randomBytes, pbkdf2 as _pbkdf2 } from 'node:crypto'
import { promisify } from 'node:util'

const pbkdf2 = promisify(_pbkdf2)
const pin = process.argv[2]

if (!pin || pin.length < 4) {
  console.error('Usage: node scripts/generate-pin-hash.mjs <pin>  (4-6 digits)')
  process.exit(1)
}

const salt = randomBytes(16)
const hash = await pbkdf2(pin, salt, 100000, 32, 'sha256')
const saltB64 = salt.toString('base64')
const hashB64 = hash.toString('base64')
console.log(`pbkdf2:${saltB64}:${hashB64}`)
