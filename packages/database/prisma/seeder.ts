import { prisma } from "../src/index";
import seedRolePermission from "./seeders/rolePermission.seeder";

async function runAllSeeders() {
  console.log("🌱 Starting database seeding...\n");

  try {
    await seedRolePermission();
    console.log("🎉 All seeders completed successfully!");

    console.log("\n🚀 Your database is now ready for development!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run all seeders if this file is executed directly
if (require.main === module) {
  runAllSeeders().catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}

export default runAllSeeders;
