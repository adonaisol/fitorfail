import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { get, run } from '../config/database.js';

const SALT_ROUNDS = 10;

export interface User {
  id: number;
  username: string;
  password_hash: string;
  skill_level: 'Beginner' | 'Intermediate' | 'Expert';
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: number;
  username: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Expert';
  createdAt: string;
}

export interface JwtPayload {
  userId: number;
  username: string;
}

export interface AuthResult {
  user: UserPublic;
  token: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    username: user.username
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

/**
 * Convert database user to public user (without password)
 */
export function toPublicUser(user: User): UserPublic {
  return {
    id: user.id,
    username: user.username,
    skillLevel: user.skill_level,
    createdAt: user.created_at
  };
}

/**
 * Find a user by username
 */
export function findUserByUsername(username: string): User | null {
  return get<User>('SELECT * FROM users WHERE username = ?', [username]);
}

/**
 * Find a user by ID
 */
export function findUserById(id: number): User | null {
  return get<User>('SELECT * FROM users WHERE id = ?', [id]);
}

/**
 * Register a new user
 */
export async function registerUser(
  username: string,
  password: string,
  skillLevel: 'Beginner' | 'Intermediate' | 'Expert' = 'Beginner'
): Promise<AuthResult> {
  // Check if username already exists
  const existingUser = findUserByUsername(username);
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Validate password
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Insert user
  const result = run(
    'INSERT INTO users (username, password_hash, skill_level) VALUES (?, ?, ?)',
    [username, passwordHash, skillLevel]
  );

  // Get the created user
  const user = findUserById(result.lastInsertRowid!);
  if (!user) {
    throw new Error('Failed to create user');
  }

  // Generate token
  const token = generateToken(user);

  // Create default preferences for the user
  run(
    'INSERT INTO user_preferences (user_id, workout_days) VALUES (?, ?)',
    [user.id, 3]
  );

  return {
    user: toPublicUser(user),
    token
  };
}

/**
 * Login a user
 */
export async function loginUser(username: string, password: string): Promise<AuthResult> {
  // Find user
  const user = findUserByUsername(username);
  if (!user) {
    throw new Error('Invalid username or password');
  }

  // Check password
  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid username or password');
  }

  // Generate token
  const token = generateToken(user);

  return {
    user: toPublicUser(user),
    token
  };
}

export default {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  toPublicUser,
  findUserByUsername,
  findUserById,
  registerUser,
  loginUser
};
