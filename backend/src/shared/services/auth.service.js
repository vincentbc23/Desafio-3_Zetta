import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const PASSWORD_ITERATIONS = 120000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = 'sha256';

export const createPasswordDigest = (password, salt = randomBytes(16).toString('hex')) => {
  const hash = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST)
    .toString('hex');

  return { salt, hash };
};

export const verifyPassword = (password, salt, expectedHash) => {
  const { hash } = createPasswordDigest(password, salt);

  const hashBuffer = Buffer.from(hash, 'hex');
  const expectedHashBuffer = Buffer.from(expectedHash, 'hex');

  if (hashBuffer.length !== expectedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, expectedHashBuffer);
};

export const createSessionToken = () => randomBytes(32).toString('hex');