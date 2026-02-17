/**
 * Type declarations for bcryptjs
 * This file provides TypeScript type definitions for the bcryptjs library
 */

declare module 'bcryptjs' {
  /**
   * Hashes a password using bcrypt
   * @param password - The password to hash
   * @param salt - The salt rounds (default: 10) or a salt string
   * @returns A promise that resolves to the hashed password
   */
  export function hash(password: string, salt: number | string): Promise<string>;

  /**
   * Compares a password with a hash
   * @param password - The password to compare
   * @param hash - The hash to compare against
   * @returns A promise that resolves to true if the password matches
   */
  export function compare(password: string, hash: string): Promise<boolean>;

  /**
   * Generates a salt
   * @param rounds - The number of salt rounds (default: 10)
   * @returns A promise that resolves to the salt string
   */
  export function genSalt(rounds?: number): Promise<string>;

  /**
   * Hashes a password with a given salt (synchronous)
   * @param password - The password to hash
   * @param salt - The salt to use
   * @returns The hashed password
   */
  export function hashSync(password: string, salt: string): string;

  /**
   * Compares a password with a hash (synchronous)
   * @param password - The password to compare
   * @param hash - The hash to compare against
   * @returns True if the password matches
   */
  export function compareSync(password: string, hash: string): boolean;

  /**
   * Generates a salt (synchronous)
   * @param rounds - The number of salt rounds (default: 10)
   * @returns The salt string
   */
  export function genSaltSync(rounds?: number): string;

  /**
   * The bcrypt algorithm version
   */
  export const version: string;

  /**
   * Constants for the bcrypt algorithm
   */
  export const constants: {
    BCRYPT_SALT_LEN: number;
    BCRYPT_MAXsaltlen: number;
  };
}
