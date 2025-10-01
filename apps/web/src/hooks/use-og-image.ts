import { useEffect, useState } from "react";
import { generateOGImage } from "@/lib/og-image-generator";
import { type OGImageData } from "@/lib/og-image-generator";

export const useOGImage = (data: OGImageData) => {
  const [ogImageUrl, setOgImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const createOGImage = async () => {
      setIsGenerating(true);
      try {
        const imageUrl = await generateOGImage(data);
        setOgImageUrl(imageUrl);
      } catch (error) {
        console.error("Failed to generate OG image:", error);
      } finally {
        setIsGenerating(false);
      }
    };

    createOGImage();
  }, [data]);

  return { ogImageUrl, isGenerating };
};
