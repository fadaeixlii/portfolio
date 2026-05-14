import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageGridItem {
  src: string;
  alt: string;
  caption?: string;
}

interface ImageGridProps {
  images: ImageGridItem[];
}

const gridClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2",
  4: "grid-cols-1 sm:grid-cols-2",
};

export function ImageGrid({ images }: ImageGridProps) {
  const cols = gridClass[Math.min(images.length, 4)] ?? "grid-cols-1 sm:grid-cols-2";

  return (
    <div className={cn("my-8 grid gap-4", cols)}>
      {images.map((img) => (
        <figure key={img.src} className="group overflow-hidden rounded-lg">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {img.caption && (
            <figcaption className="mt-2 text-center text-xs text-muted-foreground">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
