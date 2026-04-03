import { forwardRef, useCallback, useRef, useState } from "react";
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

export type ClipShape = "none" | "circle" | "rounded" | "hexagon" | "diamond" | "oval";

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
  imageOnTop?: boolean;
  clipShape?: ClipShape;
  onImageTransformChange?: (t: ImageTransform) => void;
  onTitleTransformChange?: (t: TextTransform) => void;
  onQuoteTransformChange?: (t: TextTransform) => void;
}

const defaultImageTransform: ImageTransform = { x: 0, y: 0, scale: 1, rotate: 0 };
const defaultTextTransform: TextTransform = { x: 0, y: 0 };

const CLIP_PATHS: Record<ClipShape, string | undefined> = {
  none: undefined,
  circle: "circle(48% at 50% 50%)",
  rounded: "inset(2% round 16px)",
  hexagon: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
  diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  oval: "ellipse(48% 42% at 50% 50%)",
};

// Hook for drag interactions (mouse + touch) — optimized for mobile
function useDrag(
  onDrag: (dx: number, dy: number) => void
) {
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  const onStart = useCallback((clientX: number, clientY: number) => {
    dragging.current = true;
    lastPos.current = { x: clientX, y: clientY };
    velocity.current = { x: 0, y: 0 };
    cancelAnimationFrame(rafId.current);
  }, []);

  const onMove = useCallback((clientX: number, clientY: number) => {
    if (!dragging.current) return;
    const dx = clientX - lastPos.current.x;
    const dy = clientY - lastPos.current.y;
    lastPos.current = { x: clientX, y: clientY };
    velocity.current = { x: dx, y: dy };
    // Use rAF for smooth updates
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => onDrag(dx, dy));
  }, [onDrag]);

  const onEnd = useCallback(() => {
    dragging.current = false;
    cancelAnimationFrame(rafId.current);
  }, []);

  const handlers = {
    onMouseDown: (e: React.MouseEvent) => { e.preventDefault(); onStart(e.clientX, e.clientY); },
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); const t = e.touches[0]; onStart(t.clientX, t.clientY); },
  };

  const windowHandlers = {
    onMouseMove: (e: MouseEvent) => onMove(e.clientX, e.clientY),
    onMouseUp: onEnd,
    onTouchMove: (e: TouchEvent) => { e.preventDefault(); const t = e.touches[0]; onMove(t.clientX, t.clientY); },
    onTouchEnd: onEnd,
  };

  return { handlers, windowHandlers, dragging };
}

// Draggable wrapper component
function DraggableElement({
  children,
  onDragDelta,
  className,
  style,
}: {
  children: React.ReactNode;
  onDragDelta: (dx: number, dy: number) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { handlers, windowHandlers } = useDrag(onDragDelta);
  const attached = useRef(false);

  const attach = useCallback(() => {
    if (attached.current) return;
    attached.current = true;
    window.addEventListener("mousemove", windowHandlers.onMouseMove);
    window.addEventListener("mouseup", () => { windowHandlers.onMouseUp(); detach(); });
    window.addEventListener("touchmove", windowHandlers.onTouchMove, { passive: false });
    window.addEventListener("touchend", () => { windowHandlers.onTouchEnd(); detach(); });
  }, [windowHandlers]);

  const detach = useCallback(() => {
    attached.current = false;
    window.removeEventListener("mousemove", windowHandlers.onMouseMove);
    window.removeEventListener("touchmove", windowHandlers.onTouchMove);
  }, [windowHandlers]);

  return (
    <div
      className={className}
      style={{ ...style, cursor: "grab", touchAction: "none", userSelect: "none" }}
      onMouseDown={(e) => { handlers.onMouseDown(e); attach(); }}
      onTouchStart={(e) => { handlers.onTouchStart(e); attach(); }}
    >
      {children}
    </div>
  );
}

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
      imageOnTop = false,
      clipShape = "none",
      onImageTransformChange,
      onTitleTransformChange,
      onQuoteTransformChange,
    },
    ref
  ) => {
    const {
      bgColor, textColor, accentColor, borderStyle, fontStyle,
      logoText, subtitleText, footerLabel, footerUrl,
    } = template;

    const today = new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
    const fontClass = fontStyle === "serif" || fontStyle === "decorative" ? "font-serif" : "";
    const transform = imageTransform || defaultImageTransform;
    const titlePosition = titleTransform || defaultTextTransform;
    const quotePosition = quoteTransform || defaultTextTransform;
    const isFrameMode = Boolean(bgImage);

    const clipPath = CLIP_PATHS[clipShape];

    const imageStyle: React.CSSProperties = {
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotate}deg)`,
      transformOrigin: "center center",
      willChange: "transform",
      ...(clipPath ? { clipPath } : {}),
    };

    const handleImageDrag = useCallback((dx: number, dy: number) => {
      if (!onImageTransformChange) return;
      const prev = imageTransform || defaultImageTransform;
      onImageTransformChange({ ...prev, x: prev.x + dx, y: prev.y + dy });
    }, [onImageTransformChange, imageTransform]);

    const handleTitleDrag = useCallback((dx: number, dy: number) => {
      if (!onTitleTransformChange) return;
      const prev = titleTransform || defaultTextTransform;
      onTitleTransformChange({ ...prev, x: prev.x + dx, y: prev.y + dy });
    }, [onTitleTransformChange, titleTransform]);

    const handleQuoteDrag = useCallback((dx: number, dy: number) => {
      if (!onQuoteTransformChange) return;
      const prev = quoteTransform || defaultTextTransform;
      onQuoteTransformChange({ ...prev, x: prev.x + dx, y: prev.y + dy });
    }, [onQuoteTransformChange, quoteTransform]);

    const renderLogo = () => (
      showLogo ? (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <span className="font-black text-sm" style={{ color: textColor }}>{logoText.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-black leading-tight" style={{ color: textColor }}>{logoText}</p>
            {subtitleText && <p className="text-[7px] opacity-70" style={{ color: textColor }}>{subtitleText}</p>}
          </div>
        </div>
      ) : <div />
    );

    const renderDate = () => (
      <span className="text-[8px] opacity-70" style={{ color: textColor }}>{today}</span>
    );

    // Frame mode: image behind, frame overlay on top
    if (isFrameMode) {
      // imageOnTop: image shows ABOVE frame (for initial positioning), then toggle back
      const imageZ = imageOnTop ? 30 : 5;
      const frameZ = 10;

      return (
        <div
          ref={ref}
          className={`w-full max-w-[420px] mx-auto rounded-2xl overflow-hidden shadow-2xl relative ${fontClass}`}
          style={{ backgroundColor: bgColor, border: borderStyle || "none", aspectRatio: String(frameAspectRatio || 4 / 5) }}
        >
          {/* Image layer */}
          {images[0] && (
            <DraggableElement
              onDragDelta={handleImageDrag}
              className="absolute inset-0 overflow-hidden"
              style={{ zIndex: imageZ }}
            >
              <img
                src={images[0].preview}
                alt={title || "ফটো কার্ড"}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                crossOrigin="anonymous"
                style={imageStyle}
                draggable={false}
              />
            </DraggableElement>
          )}

          {/* Frame overlay */}
          {bgImage && (
            <img
              src={bgImage}
              alt="ফ্রেম"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ opacity: bgOpacity, zIndex: frameZ }}
              draggable={false}
            />
          )}

          {/* Text & controls layer */}
          <div className="absolute inset-0 p-4" style={{ zIndex: 20 }}>
            <div className="flex items-start justify-between gap-3">
              {renderLogo()}
              {renderDate()}
            </div>

            {title && (
              <DraggableElement
                onDragDelta={handleTitleDrag}
                className="absolute left-6 right-6"
                style={{ top: "22%", transform: `translate(${titlePosition.x}px, ${titlePosition.y}px)` }}
              >
                <h3 className="text-lg font-black leading-snug drop-shadow-sm" style={{ color: textColor }}>{title}</h3>
              </DraggableElement>
            )}

            {quote && (
              <DraggableElement
                onDragDelta={handleQuoteDrag}
                className="absolute left-6 right-6"
                style={{ top: "36%", transform: `translate(${quotePosition.x}px, ${quotePosition.y}px)` }}
              >
                <p className="text-sm italic leading-relaxed drop-shadow-sm border-l-4 pl-3"
                  style={{ color: textColor, borderColor: accentColor }}>
                  ❝ {quote} ❞
                </p>
              </DraggableElement>
            )}

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold opacity-80" style={{ color: textColor }}>{footerLabel || logoText}</p>
                <p className="text-[8px] opacity-60" style={{ color: textColor }}>{footerUrl}</p>
                {images[0]?.caption && <p className="text-[9px] mt-1 opacity-80" style={{ color: textColor }}>{images[0].caption}</p>}
              </div>
              {showQr && (
                <div className="bg-white rounded-lg p-1.5 shrink-0">
                  <QRCodeSVG value={qrUrl} size={48} />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Normal mode (no frame)
    return (
      <div
        ref={ref}
        className={`w-full max-w-[420px] mx-auto rounded-2xl overflow-hidden shadow-2xl relative ${fontClass}`}
        style={{ backgroundColor: bgColor, border: borderStyle || "none" }}
      >
        <div className="relative z-10">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            {showLogo && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background/60">
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

          {images[0] && (
            <div className="px-3">
              <DraggableElement
                onDragDelta={handleImageDrag}
                className="rounded-xl overflow-hidden aspect-[4/3] relative"
              >
                <img
                  src={images[0].preview}
                  alt={title || "ফটো কার্ড"}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  crossOrigin="anonymous"
                  style={imageStyle}
                  draggable={false}
                />
              </DraggableElement>
              {images[0].caption && (
                <p className="text-[9px] mt-1 opacity-60 text-center" style={{ color: textColor }}>{images[0].caption}</p>
              )}
            </div>
          )}

          {title && (
            <DraggableElement
              onDragDelta={handleTitleDrag}
              className="px-4 pt-3"
              style={{ transform: `translate(${titlePosition.x}px, ${titlePosition.y}px)` }}
            >
              <h3 className="text-base font-black leading-relaxed" style={{ color: textColor }}>{title}</h3>
            </DraggableElement>
          )}

          {quote && (
            <DraggableElement
              onDragDelta={handleQuoteDrag}
              className="px-4 pt-2"
              style={{ transform: `translate(${quotePosition.x}px, ${quotePosition.y}px)` }}
            >
              <div className="border-r-2 pr-3" style={{ borderColor: accentColor }}>
                <p className="text-xs italic leading-relaxed opacity-80" style={{ color: textColor }}>❝ {quote} ❞</p>
              </div>
            </DraggableElement>
          )}

          <div className="px-4 pt-3 pb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[8px] font-bold opacity-60" style={{ color: textColor }}>{footerLabel || logoText}</p>
              <p className="text-[7px] opacity-40" style={{ color: textColor }}>{footerUrl}</p>
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
      </div>
    );
  }
);

CardPreview.displayName = "CardPreview";
export default CardPreview;
