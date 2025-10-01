import { useEffect } from "react";
import { useOGImage } from "@/hooks/use-og-image";
import { type OGImageData } from "@/lib/og-image-generator";

interface OGMetaProps {
  data: OGImageData;
  url?: string;
  description?: string;
}

export const OGMeta = ({ data, url, description }: OGMetaProps) => {
  const { ogImageUrl } = useOGImage(data);

  useEffect(() => {
    if (!ogImageUrl) return;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(
        `meta[property="${property}"]`
      ) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    const updateMetaName = (name: string, content: string) => {
      let meta = document.querySelector(
        `meta[name="${name}"]`
      ) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Open Graph tags
    updateMetaTag("og:title", data.title);
    updateMetaTag(
      "og:description",
      description ||
        `Sistem rekam medis ${data.hospitalName || "RSUD Mamuju Tengah"}`
    );
    updateMetaTag("og:image", ogImageUrl);
    updateMetaTag("og:image:width", "1200");
    updateMetaTag("og:image:height", "630");
    updateMetaTag("og:image:type", "image/png");
    updateMetaTag("og:url", url || window.location.href);
    updateMetaTag("og:type", "website");
    updateMetaTag("og:site_name", data.hospitalName || "RSUD Mamuju Tengah");

    // Twitter Card tags
    updateMetaName("twitter:card", "summary_large_image");
    updateMetaName("twitter:title", data.title);
    updateMetaName(
      "twitter:description",
      description ||
        `Sistem rekam medis ${data.hospitalName || "RSUD Mamuju Tengah"}`
    );
    updateMetaName("twitter:image", ogImageUrl);

    // Additional meta tags
    updateMetaName(
      "description",
      description ||
        `Sistem rekam medis ${data.hospitalName || "RSUD Mamuju Tengah"}`
    );

    // Update page title
    document.title = data.title;
  }, [ogImageUrl, data, url, description]);

  return null; // This component doesn't render anything
};
