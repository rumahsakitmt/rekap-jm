import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <div className="py-8 flex items-center justify-center gap-2 text-sm text-muted-foreground uppercase border-y border-dashed">
      <div className="container mx-auto border-x border-dashed flex items-center justify-center gap-2 text-xs">
        Made with <Heart className="text-primary" strokeWidth={1} /> by IT RSUD
        Mamuju Tengah
      </div>
    </div>
  );
};
