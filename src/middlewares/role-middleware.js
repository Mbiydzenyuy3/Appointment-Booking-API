//middleware/role-middleware.js
export function requireProvider(req, res, next) {
  if (req.user?.role !== "provider") {
    return res.status(403).json({error: "Only providers can perform this action"})
  }
  next();
}