import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { CardTemplate } from "./CardTemplates";

interface CardImage {
  file: File;
  preview: string;
  caption: string;
}

interface CardPreviewProps {
  template: CardTemplate;
  title: string;
  quote: string;
  images: CardImage[];
  showQr: boolean;
  showLogo: boolean;
  qrUrl: string;
  bgImage?: string;
  titleSize?: number;
  quoteSize?: number;
  imageX?: number;
  imageY?: number;
  imageScale?: number;
}

const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(
  ({ template, title, quote, images, showQr, showLogo, qrUrl, bgImage, titleSize = 16, quoteSize = 12, imageX = 0, imageY = 0, imageScale = 100 }, ref) => {
    const { bgColor, textColor, accentColor, borderStyle, fontStyle, logoText, subtitleText, footerLabel, footerUrl } = template;
    const today = new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });

    return (
      <div
        ref={ref}
        className="rounded-2xl overflow-hidden shadow-2xl max-w-[400px] mx-auto relative"
        style={{
          backgroundColor: bgColor,
          border: borderStyle || "none",
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          fontFamily: fontStyle === "decorative" ? "'Hind Siliguri', sans-serif" : fontStyle === "serif" ? "serif" : "inherit",
        }}
      >
        {bgImage && <div className="absolute inset-0 bg-black/40 rounded-2xl" />}

        <div className="relative z-10">
          {/* Header */}
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            {showLogo && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}33` }}>
                  <span className="font-black text-sm" style={{ color: textColor }}>{logoText.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-black leading-tight" style={{ color: textColor }}>{logoText}</p>
                  {subtitleText && <p className="text-[7px] opacity-60" style={{ color: textColor }}>{subtitleText}</p>}
                </div>
              </div>
            )}
            <span className="text-[8px] opacity-50" style={{ color: textColor }}>{today}</span>
          </div>

          {/* Main Image with transform controls */}
          {images[0] && (
            <div className="px-3">
              <div className="rounded-xl overflow-hidden aspect-[4/3]">
                <img
                  src={images[0].preview}
                  alt=""
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  style={{
                    transform: `translate(${imageX}px, ${imageY}px) scale(${imageScale / 100})`,
                    transformOrigin: "center center",
                  }}
                />
              </div>
              {images[0].caption && (
                <p className="text-[9px] mt-1 opacity-60 text-center" style={{ color: textColor }}>{images[0].caption}</p>
              )}
            </div>
          )}

          {/* Title */}
          {title && (
            <div className="px-4 pt-3">
              <h3 className="font-black leading-relaxed" style={{ color: textColor, fontSize: `${titleSize}px` }}>{title}</h3>
            </div>
          )}

          {/* Quote */}
          {quote && (
            <div className="px-4 pt-2">
              <div className="border-r-2 pr-3" style={{ borderColor: `${accentColor}80` }}>
                <p className="italic leading-relaxed opacity-80" style={{ color: textColor, fontSize: `${quoteSize}px` }}>❝ {quote} ❞</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 pt-3 pb-4 flex items-end justify-between">
            <div>
              <p className="text-[8px] font-bold opacity-60" style={{ color: textColor }}>{footerLabel || logoText}</p>
              <p className="text-[7px] opacity-40" style={{ color: textColor }}>{footerUrl}</p>
            </div>
            {showQr && (
              <div className="bg-white rounded-lg p-1.5">
                <QRCodeSVG value={qrUrl} size={48} />
              </div>
            )}
          </div>

          {/* Additional images grid */}
          {images.length > 1 && (
            <div className="px-3 pb-3 grid grid-cols-3 gap-1.5">
              {images.slice(1, 4).map((img, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden aspect-square relative">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                      <p className="text-[7px] text-white truncate">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

CardPreview.displayName = "CardPreview";
export default CardPreview;
