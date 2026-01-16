import { prisma } from "@packages/database";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../../interfaces";

const PermissionMiddleware = (permissionName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const roles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: { rolePermissions: { include: { permission: true } } },
        },
      },
    });

    const userPermissions = roles.flatMap((r) =>
      r.role.rolePermissions.map((rp) => rp.permission.name)
    );

    if (!userPermissions.includes(permissionName)) {
      return res.status(401).json({
        code: 403,
        message: "Forbidden: no permission",
        data: null,
      });
    }

    next();
  };
};

export default PermissionMiddleware;
