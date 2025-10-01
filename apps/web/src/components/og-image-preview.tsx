import { useState } from "react";
import { Button } from "./ui/button";
import { useOGImage } from "@/hooks/use-og-image";
import { type OGImageData } from "@/lib/og-image-generator";

export const OGImagePreview = () => {
  const [previewType, setPreviewType] = useState<
    "rawat-jalan" | "rawat-inap" | "report"
  >("rawat-jalan");

  const sampleData: Record<string, OGImageData> = {
    "rawat-jalan": {
      title: "Rekap Rawat Jalan - SEP Mei 2024",
      subtitle: "Data Rekam Medis Rawat Jalan",
      type: "rawat-jalan",
      dateRange: "01 Mei 2024 - 31 Mei 2024",
      totalRecords: 1250,
      hospitalName: "RSUD Mamuju Tengah",
    },
    "rawat-inap": {
      title: "Rekap Rawat Inap - SEP Ranap Mei",
      subtitle: "Data Rekam Medis Rawat Inap",
      type: "rawat-inap",
      dateRange: "01 Mei 2024 - 31 Mei 2024",
      totalRecords: 450,
      hospitalName: "RSUD Mamuju Tengah",
    },
    report: {
      title: "Laporan Rekap JM",
      subtitle: "Ringkasan Data Rekam Medis",
      type: "report",
      dateRange: "01 Mei 2024 - 31 Mei 2024",
      totalRecords: 1700,
      hospitalName: "RSUD Mamuju Tengah",
    },
  };

  const { ogImageUrl, isGenerating } = useOGImage(sampleData[previewType]);

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">OG Image Preview</h3>

      <div className="flex gap-2">
        <Button
          variant={previewType === "rawat-jalan" ? "default" : "outline"}
          onClick={() => setPreviewType("rawat-jalan")}
        >
          Rawat Jalan
        </Button>
        <Button
          variant={previewType === "rawat-inap" ? "default" : "outline"}
          onClick={() => setPreviewType("rawat-inap")}
        >
          Rawat Inap
        </Button>
        <Button
          variant={previewType === "report" ? "default" : "outline"}
          onClick={() => setPreviewType("report")}
        >
          Report
        </Button>
      </div>

      {isGenerating ? (
        <div className="w-full h-[315px] bg-gray-100 rounded-lg flex items-center justify-center">
          <p>Generating OG image...</p>
        </div>
      ) : ogImageUrl ? (
        <div className="space-y-2">
          <img
            src={ogImageUrl}
            alt="OG Image Preview"
            className="w-full max-w-2xl rounded-lg border"
            style={{ aspectRatio: "1200/630" }}
          />
          <p className="text-sm text-gray-600">
            This is how your shared links will appear on social media
          </p>
        </div>
      ) : null}
    </div>
  );
};
