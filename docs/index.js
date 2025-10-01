// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/email.ts
import { MailService } from "@sendgrid/mail";
var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
var initMailService = () => {
  if (!SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY is not set. Email functionality will be simulated.");
    return null;
  }
  const mailService2 = new MailService();
  mailService2.setApiKey(SENDGRID_API_KEY);
  return mailService2;
};
var mailService = initMailService();
var sendEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    if (!mailService) {
      console.log("Email would be sent (simulation):", {
        to: "info@bluemindfreediving.nl",
        from: "noreply@bluemindfreediving.nl",
        subject: `Contact Form: ${subject}`,
        text: `From: ${name} (${email})

${message}`
      });
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      return res.status(200).json({
        success: true,
        message: "Email simulation successful"
      });
    }
    await mailService.send({
      to: "info@bluemindfreediving.nl",
      from: "noreply@bluemindfreediving.nl",
      subject: `Contact Form: ${subject}`,
      text: `From: ${name} (${email})

${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `
    });
    return res.status(200).json({
      success: true,
      message: "Email sent successfully"
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email"
    });
  }
};

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.json({ status: "UP" });
  });
  app2.post("/api/send-email", sendEmail);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large libraries
          vendor: ["react", "react-dom"],
          mui: ["@mui/material", "@mui/icons-material"]
          // Material UI can be quite large, separate it
        }
      }
    },
    // Optimize chunk sizes
    chunkSizeWarningLimit: 1e3,
    // Enable source maps for debugging in production (optional)
    sourcemap: false
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 5e3;
  const tryListen = (retryPort) => {
    server.listen(retryPort, "0.0.0.0", () => {
      log(`serving on port ${retryPort}`);
    }).on("error", (e) => {
      if (e.code === "EADDRINUSE" && retryPort < 5010) {
        tryListen(retryPort + 1);
      } else {
        throw e;
      }
    });
  };
  tryListen(Number(port));
})();
