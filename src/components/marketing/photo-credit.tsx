import type { PHOTOS } from "@/lib/site-config";

type Photo = (typeof PHOTOS)[keyof typeof PHOTOS];

// Attribution affichée sur la photo elle-même : exigée par les licences
// CC BY-SA des images Wikimedia Commons utilisées sur la vitrine.
export function PhotoCredit({ photo, className = "" }: { photo: Photo; className?: string }) {
  return (
    <a
      href={photo.source}
      target="_blank"
      rel="noopener noreferrer"
      className={`absolute z-10 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur-sm transition-colors hover:bg-black/55 hover:text-white ${className}`}
    >
      Photo : {photo.auteur}, {photo.licence}
    </a>
  );
}
