import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Check, Share } from "lucide-react";

interface ShareButtonProps {
  title?: string;
  description?: string;
}

export const ShareButton = ({ title, description }: ShareButtonProps) => {
  const [success, setSuccess] = useState(false);

  const handleShare = async () => {
    try {
      // Try Web Share API first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: title || document.title,
          text: description || "Lihat data rekam medis RSUD Mamuju Tengah",
          url: window.location.href,
        });
        setSuccess(true);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setSuccess(true);
      }
    } catch (err) {
      console.error("Failed to share: ", err);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <Button variant="outline" onClick={handleShare}>
      {success ? <Check /> : <Share />}
      Bagikan
    </Button>
  );
};
