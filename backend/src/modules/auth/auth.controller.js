import { randomUUID } from 'node:crypto';
import { query, withTransaction } from '../../shared/db/client.js';
import { createSessionToken, verifyPassword } from '../../shared/services/auth.service.js';

const SESSION_HOURS = 12;

const getBearerToken = (authorizationHeader = '') => {
  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token.trim();
};

const serializeFirefighter = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
});

export const loginFirefighter = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const senha = String(req.body?.senha || '');

    if (!email || !senha) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    const result = await query(
      `
        SELECT id, name, email, password_salt, password_hash, role, active
        FROM firefighters
        WHERE email = $1
        LIMIT 1
      `,
      [email]
    );

    const firefighter = result.rows[0];

    if (!firefighter || !firefighter.active) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isPasswordValid = verifyPassword(senha, firefighter.password_salt, firefighter.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);

    await withTransaction(async (client) => {
      await client.query(
        `
          INSERT INTO auth_sessions (id, firefighter_id, token, expires_at, last_used_at)
          VALUES ($1, $2, $3, $4, NOW())
        `,
        [randomUUID(), firefighter.id, token, expiresAt.toISOString()]
      );

      await client.query(
        `
          UPDATE firefighters
          SET last_login_at = NOW()
          WHERE id = $1
        `,
        [firefighter.id]
      );
    });

    return res.status(200).json({
      token,
      expiresAt: expiresAt.toISOString(),
      firefighter: serializeFirefighter(firefighter),
    });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentFirefighter = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação ausente.' });
    }

    const result = await query(
      `
        SELECT
          f.id,
          f.name,
          f.email,
          f.role,
          f.active,
          s.expires_at,
          s.revoked_at
        FROM auth_sessions s
        INNER JOIN firefighters f ON f.id = s.firefighter_id
        WHERE s.token = $1
        LIMIT 1
      `,
      [token]
    );

    const session = result.rows[0];

    if (!session || !session.active || session.revoked_at || new Date(session.expires_at) <= new Date()) {
      return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
    }

    await query(
      `
        UPDATE auth_sessions
        SET last_used_at = NOW()
        WHERE token = $1
      `,
      [token]
    );

    return res.status(200).json({ firefighter: serializeFirefighter(session) });
  } catch (error) {
    return next(error);
  }
};

export const logoutFirefighter = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(200).json({ ok: true });
    }

    await query(
      `
        UPDATE auth_sessions
        SET revoked_at = NOW()
        WHERE token = $1
      `,
      [token]
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    return next(error);
  }
};