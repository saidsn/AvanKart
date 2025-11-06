import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getIcon = async (req, res) => {
  try {
    const { icon } = req.params;
    if (!icon) {
      return res.status(400).json({ error: "Icon param is required" });
    }

    const iconPath = path.join(__dirname, "../public/icons", `${icon}.svg`);
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.type("image/svg+xml"); // Content-Type header set
    return res.sendFile(iconPath);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load icon" });
  }
};
