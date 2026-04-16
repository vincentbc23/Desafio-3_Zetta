export const getHealth = (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'd3-zetta-backend',
    timestamp: new Date().toISOString(),
  });
};
