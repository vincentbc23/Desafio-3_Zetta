import { query } from '../db/client.js';

const getBearerToken = (authorizationHeader = '') => {
  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token.trim();
};

export const authenticateFirefighter = async (req, res, next) => {
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

    req.firefighter = {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export const authorizeFirefighterRoles = (allowedRoles = []) => {
  const normalizedAllowedRoles = allowedRoles.map((role) => String(role || '').trim().toLowerCase());

  return (req, res, next) => {
    const currentRole = String(req.firefighter?.role || '').trim().toLowerCase();

    if (!currentRole || !normalizedAllowedRoles.includes(currentRole)) {
      return res.status(403).json({ message: 'Você não possui permissão para acessar este recurso.' });
    }

    return next();
  };
};