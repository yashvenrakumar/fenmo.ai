const app = require("./app");
const { initializeDatabase } = require("./config/db");

const PORT = Number(process.env.PORT || 4000);

async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start backend:", error);
  process.exit(1);
});
