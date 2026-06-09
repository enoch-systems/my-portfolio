/**
 * Transform a Cloudinary image URL with optimization parameters.
 * Adds f_auto (format auto), q_auto (quality auto), and optional width/height.
 */
export function optimizeCloudinaryUrl(
  url: string,
  width?: number
): string {
  if (!url.includes("res.cloudinary.com")) return url;

  // Replace /upload/ with /upload/f_auto,q_auto,w_WIDTH/
  const transforms = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);
  const transformStr = transforms.join(",");

  return url.replace("/upload/", `/upload/${transformStr}/`);
}

/**
 * Generate a tiny blurred placeholder URL for Cloudinary images.
 * This is used for next/image blurDataURL.
 */
export function getCloudinaryBlurUrl(url: string): string {
  if (!url.includes("res.cloudinary.com")) return "";

  // e_blur:1000 = maximum blur, w_10 = 10px wide (tiny)
  return url.replace("/upload/", "/upload/e_blur:1000,w_10/");
}


