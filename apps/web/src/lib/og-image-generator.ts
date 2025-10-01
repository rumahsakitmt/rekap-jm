export interface OGImageData {
  title: string;
  subtitle?: string;
  type: "rawat-jalan" | "rawat-inap" | "report" | "default";
  dateRange?: string;
  totalRecords?: number;
  hospitalName?: string;
}

export const generateOGImage = async (data: OGImageData): Promise<string> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas context not available");

  // Set canvas size (1200x630 is the recommended OG image size)
  canvas.width = 1200;
  canvas.height = 630;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, "#1e40af"); // Blue
  gradient.addColorStop(1, "#3b82f6"); // Lighter blue
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Add subtle pattern overlay
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  for (let i = 0; i < 1200; i += 40) {
    for (let j = 0; j < 630; j += 40) {
      if ((i + j) % 80 === 0) {
        ctx.fillRect(i, j, 20, 20);
      }
    }
  }

  // Hospital name
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "bold 32px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(data.hospitalName || "RSUD Mamuju Tengah", 60, 80);

  // Main title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";

  // Wrap text if too long
  const maxWidth = 800;
  const words = data.title.split(" ");
  let line = "";
  let y = 180;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, 60, y);
      line = words[n] + " ";
      y += 60;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 60, y);

  // Subtitle
  if (data.subtitle) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "24px Inter, system-ui, sans-serif";
    ctx.fillText(data.subtitle, 60, y + 80);
  }

  // Type badge
  const typeColors = {
    "rawat-jalan": "#10b981",
    "rawat-inap": "#f59e0b",
    report: "#8b5cf6",
    default: "#6b7280",
  };

  const typeLabels = {
    "rawat-jalan": "Rawat Jalan",
    "rawat-inap": "Rawat Inap",
    report: "Laporan",
    default: "Sistem",
  };

  const badgeColor = typeColors[data.type];
  const badgeText = typeLabels[data.type];

  // Badge background
  ctx.fillStyle = badgeColor;
  ctx.roundRect(60, y + 120, 200, 50, 25);
  ctx.fill();

  // Badge text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(badgeText, 160, y + 150);

  // Stats section
  if (data.dateRange || data.totalRecords) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "20px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";

    let statsY = y + 200;

    if (data.dateRange) {
      ctx.fillText(`Periode: ${data.dateRange}`, 60, statsY);
      statsY += 35;
    }

    if (data.totalRecords) {
      ctx.fillText(
        `Total: ${data.totalRecords.toLocaleString()} rekaman`,
        60,
        statsY
      );
    }
  }

  // Medical icon (simple cross)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";

  const iconX = 1000;
  const iconY = 150;
  const iconSize = 80;

  // Cross
  ctx.beginPath();
  ctx.moveTo(iconX, iconY - iconSize / 2);
  ctx.lineTo(iconX, iconY + iconSize / 2);
  ctx.moveTo(iconX - iconSize / 2, iconY);
  ctx.lineTo(iconX + iconSize / 2, iconY);
  ctx.stroke();

  // URL at bottom
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "18px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("rekap-jm.rsudmamujutengah.go.id", 600, 580);

  return canvas.toDataURL("image/png");
};

// Helper function for rounded rectangles
declare global {
  interface CanvasRenderingContext2D {
    roundRect(
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ): void;
  }
}

CanvasRenderingContext2D.prototype.roundRect = function (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  this.beginPath();
  this.moveTo(x + radius, y);
  this.lineTo(x + width - radius, y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius);
  this.lineTo(x + width, y + height - radius);
  this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  this.lineTo(x + radius, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);
  this.closePath();
};
