import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { CardTemplate } from "./CardTemplates";

interface CardImage {
  file?: File;
  preview: string;
  caption: string;
}

export interface PositionTransform {
  x: number;
  y: number;
}

export interface ImageTransform extends PositionTransform {
  scale: number;
  rotate: number;
}

export interface TextTransform extends PositionTransform {}

interface CardPreviewProps {
  template: CardTemplate;
  title: string;
  quote: string;
  images: CardImage[];
  showQr: boolean;
  showLogo: boolean;
  qrUrl: string;
  bgImage?: string;
  bgOpacity?: number;
  frameAspectRatio?: number;
  imageTransform?: ImageTransform;
  titleTransform?: TextTransform;
  quoteTransform?: TextTransform;
}

const defaultImageTransform: ImageTransform = { x: 0, y: 0, scale: 1, rotate: 0 };
const defaultTextTransform: TextTransform = { x: 0, y: 0 };

const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(
  (
    {
      template,
      title,
      quote,
      images,
      showQr,
      showLogo,
      qrUrl,
      bgImage,
      bgOpacity = 1,
      frameAspectRatio,
      imageTransform,
      titleTransform,
      quoteTransform,
    },
    ref
  ) => {
    const {
      bgColor,
      textColor,
      accentColor,
      borderStyle,
      fontStyle,
      logoText,
      subtitleText,
      footerLabel,
      footerUrl,
    } = template;

    const today = new Date().toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const fontClass = fontStyle === "serif" || fontStyle === "decorative" ? "font-serif" : "";
    const transform = imageTransform || defaultImageTransform;
    const titlePosition = titleTransform || defaultTextTransform;
    const quotePosition = quoteTransform || defaultTextTransform;
    const isFrameMode = Boolean(bgImage);

    const imageStyle = {
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotate}deg)`,
      transformOrigin: "center center",
      willChange: "transform" as const,
    };

    return (
      <div
        ref={ref}
        className={`w-full max-w-[420px] mx-auto rounded-2xl overflow-hidden shadow-2xl relative ${fontClass}`}
        style={{
          backgroundColor: bgColor,
          border: borderStyle || "none",
          aspectRatio: isFrameMode ? String(frameAspectRatio || 4 / 5) : undefined,
        }}
      >
        {isFrameMode ? (
          <>
            <div className="absolute inset-0 overflow-hidden">
              {images[0] && (
                <img
                  src={images[0].preview}
                  alt={title || "ফটো কার্ড"}
                  className="absolute inset-0 w-full h-full object-cover"
                  crossOrigin="anonymous"
                  style={imageStyle}
                />
              )}
            </div>

            {bgImage && (
              <img
                src={bgImage}
                alt="আপলোড করা ফ্রেম"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
                style={{ opacity: bgOpacity }}
              />
            )}

            <div className="absolute inset-0 z-20 p-4">
              <div className="flex items-start justify-between gap-3">
                {showLogo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background/70 backdrop-blur-sm">
                      <span className="font-black text-sm" style={{ color: textColor }}>
                        {logoText.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-black leading-tight" style={{ color: textColor }}>
                        {logoText}
                      </p>
                      {subtitleText && (
                        <p className="text-[7px] opacity-70" style={{ color: textColor }}>
                          {subtitleText}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div />
                )}
                <span className="text-[8px] opacity-70" style={{ color: textColor }}>
                  {today}
                </span>
              </div>

              {title && (
                <div
                  className="absolute left-6 right-6"
                  style={{ top: "22%", transform: `translate(${titlePosition.x}px, ${titlePosition.y}px)` }}
                >
                  <h3 className="text-lg font-black leading-snug drop-shadow-sm" style={{ color: textColor }}>
                    {title}
                  </h3>
                </div>
              )}

              {quote && (
                <div
                  className="absolute left-6 right-6"
                  style={{ top: "36%", transform: `translate(${quotePosition.x}px, ${quotePosition.y}px)` }}
                >
                  <p
                    className="text-sm italic leading-relaxed drop-shadow-sm border-l-4 pl-3"
                    style={{ color: textColor, borderColor: accentColor }}
                  >
                    ❝ {quote} ❞
                  </p>
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold opacity-80" style={{ color: textColor }}>
                    {footerLabel || logoText}
                  </p>
                  <p className="text-[8px] opacity-60" style={{ color: textColor }}>
                    {footerUrl}
                  </p>
                  {images[0]?.caption && (
                    <p className="text-[9px] mt-1 opacity-80" style={{ color: textColor }}>
                      {images[0].caption}
                    </p>
                  )}
                </div>

                {showQr && (
                  <div className="bg-white rounded-lg p-1.5 shrink-0">
                    <QRCodeSVG value={qrUrl} size={48} />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="relative z-10">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              {showLogo && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background/60">
                    <span className="font-black text-sm" style={{ color: textColor }}>
                      {logoText.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-black leading-tight" style={{ color: textColor }}>
                      {logoText}
                    </p>
                    {subtitleText && (
                      <p className="text-[7px] opacity-60" style={{ color: textColor }}>
                        {subtitleText}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <span className="text-[8px] opacity-50" style={{ color: textColor }}>
                {today}
              </span>
            </div>

            {images[0] && (
              <div className="px-3">
                <div className="rounded-xl overflow-hidden aspect-[4/3] relative">
                  <img
                    src={images[0].preview}
                    alt={title || "ফটো কার্ড"}
                    className="absolute inset-0 w-full h-full object-cover"
                    crossOrigin="anonymous"
                    style={imageStyle}
                  />
                </div>
                {images[0].caption && (
                  <p className="text-[9px] mt-1 opacity-60 text-center" style={{ color: textColor }}>
                    {images[0].caption}
                  </p>
                )}
              </div>
            )}

            {title && (
              <div
                className="px-4 pt-3"
                style={{ transform: `translate(${titlePosition.x}px, ${titlePosition.y}px)` }}
              >
                <h3 className="text-base font-black leading-relaxed" style={{ color: textColor }}>
                  {title}
                </h3>
              </div>
            )}

            {quote && (
              <div
                className="px-4 pt-2"
                style={{ transform: `translate(${quotePosition.x}px, ${quotePosition.y}px)` }}
              >
                <div className="border-r-2 pr-3" style={{ borderColor: accentColor }}>
                  <p className="text-xs italic leading-relaxed opacity-80" style={{ color: textColor }}>
                    ❝ {quote} ❞
                  </p>
                </div>
              </div>
            )}

            <div className="px-4 pt-3 pb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[8px] font-bold opacity-60" style={{ color: textColor }}>
                  {footerLabel || logoText}
                </p>
                <p className="text-[7px] opacity-40" style={{ color: textColor }}>
                  {footerUrl}
                </p>
              </div>
              {showQr && (
                <div className="bg-white rounded-lg p-1.5 shrink-0">
                  <QRCodeSVG value={qrUrl} size={48} />
                </div>
              )}
            </div>

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
        )}
      </div>
    );
  }
);

CardPreview.displayName = "CardPreview";
export default CardPreview;
