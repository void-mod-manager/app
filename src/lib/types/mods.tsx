interface ModType {
  id: string;
  name: string;
  description: string;
  short_description: string;
  thumbnail_image: string;
  user_avatar: string;
  user_name: string;
  downloads: string;
  views: number;
}

interface ExtendedMod extends ModType {
  // Add extra fields here
  header_image: string;
  caoursel_images: string[];
  installed: boolean;
  version?: string;
}

interface ModTag {
  id: string;
  name: string;
}

export type { ModType, ExtendedMod, ModTag };
