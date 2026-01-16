import { prisma } from "../../src/index";

async function seedRolePermission() {
  const roles = [{ name: "Admin" }, { name: "Users" }];

  const permissions = [
    // User Management
    { name: "read_users" },
    { name: "create_users" },
    { name: "update_users" },
    { name: "delete_users" },

    { name: "read_profiles" },
    { name: "update_profiles" },
    { name: "delete_profiles" },

    // Role
    { name: "read_roles" },
    { name: "create_roles" },
    { name: "update_roles" },
    { name: "delete_roles" },

    // Permission
    { name: "read_permissions" },
    { name: "create_permissions" },
    { name: "update_permissions" },
    { name: "delete_permissions" },
  ];

  // insert roles
  await prisma.role.createMany({
    data: roles,
    skipDuplicates: true,
  });

  // insert permissions
  await prisma.permission.createMany({
    data: permissions,
    skipDuplicates: true,
  });

  // ambil semua role & permission yang sudah masuk
  const allRoles = await prisma.role.findMany();
  const allPermissions = await prisma.permission.findMany();

  const adminRole = allRoles.find((r) => r.name === "Admin");
  const userRole = allRoles.find((r) => r.name === "Users");

  if (adminRole) {
    await prisma.rolePermission.createMany({
      data: allPermissions.map((perm) => ({
        roleId: adminRole.id,
        permissionId: perm.id,
      })),
      skipDuplicates: true,
    });
  }

  if (userRole) {
    // Users hanya bisa view assets, view characters, view effects, view fonts
    const basicPerms = allPermissions.filter((p) =>
      ["read_profiles", "update_profiles"].includes(p.name)
    );

    await prisma.rolePermission.createMany({
      data: basicPerms.map((perm) => ({
        roleId: userRole.id,
        permissionId: perm.id,
      })),
      skipDuplicates: true,
    });
  }

  console.log("✅ Seed roles & permissions completed");
}

export default seedRolePermission;

if (require.main === module) {
  seedRolePermission()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
