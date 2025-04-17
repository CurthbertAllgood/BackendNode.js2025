// src/middlewares/authorization.js

function authorization(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: "error", message: "Usuario no autenticado" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: `Acceso denegado: se requiere uno de los roles: [${roles.join(", ")}]`
      });
    }

    next();
  };
}

module.exports = { authorization };
