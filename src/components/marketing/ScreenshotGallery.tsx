import { BrowserFrame } from "@/components/marketing/BrowserFrame";
import { PhoneFrame } from "@/components/marketing/PhoneFrame";

interface GalleryItem {
  src: string;
  alt: string;
  span?: 1 | 2 | 3 | 4 | 5 | 6;
  kind?: "browser" | "phone";
}

interface ScreenshotGalleryProps {
  items: GalleryItem[];
  hue?: number;
}

const spanClasses: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
};

export function ScreenshotGallery({ items, hue }: ScreenshotGalleryProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid auto-rows-auto grid-cols-6 gap-4" style={{ gridAutoFlow: "dense" }}>
      {items.map((item, i) => {
        const span = item.span ?? 3;
        const Frame = item.kind === "phone" ? PhoneFrame : BrowserFrame;
        const frameProps = item.kind === "phone"
          ? { hue }
          : { hue, url: item.alt };

        return (
          <div key={i} className={spanClasses[span]}>
            <Frame {...frameProps}>
              <div className="flex h-full items-center justify-center bg-muted/30 p-4">
                <span className="text-xs text-muted-foreground">{item.alt}</span>
              </div>
            </Frame>
          </div>
        );
      })}
    </div>
  );
}
