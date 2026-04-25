import { cn } from "@/src/lib/utils";
import type { ReactNode, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  View,
  useWindowDimensions,
  type LayoutRectangle,
} from "react-native";

const VIEWPORT_PADDING = 16;
const DEFAULT_OFFSET = 8;
const DEFAULT_MIN_WIDTH = 220;
const DEFAULT_MAX_WIDTH = 520;
const DEFAULT_ESTIMATED_HEIGHT = 280;

type AnchoredPopoverAlign = "start" | "end";

type AnchoredPopoverRenderProps = {
  anchorRef: RefObject<View | null>;
  openPopover: () => void;
  closePopover: () => void;
  isOpen: boolean;
};

type AnchoredPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: (props: AnchoredPopoverRenderProps) => ReactNode;
  children: ReactNode;
  align?: AnchoredPopoverAlign;
  offset?: number;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
  estimatedHeight?: number;
  backdropClassName?: string;
  contentClassName?: string;
};

export function AnchoredPopover({
  open,
  onOpenChange,
  trigger,
  children,
  align = "start",
  offset = DEFAULT_OFFSET,
  minWidth = DEFAULT_MIN_WIDTH,
  maxWidth = DEFAULT_MAX_WIDTH,
  width,
  estimatedHeight = DEFAULT_ESTIMATED_HEIGHT,
  backdropClassName = "bg-black/40",
  contentClassName = "rounded-[24px] border border-shellLine bg-shellCanvas p-3 shadow-2xl shadow-black/60 web:backdrop-blur-md",
}: AnchoredPopoverProps) {
  const anchorRef = useRef<View>(null);
  const [anchorRect, setAnchorRect] = useState<LayoutRectangle | null>(null);
  const { width: viewportWidth, height: viewportHeight } =
    useWindowDimensions();

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(syncAnchorPosition);

    return () => cancelAnimationFrame(frame);
  }, [open, viewportHeight, viewportWidth]);

  function syncAnchorPosition() {
    anchorRef.current?.measureInWindow((x, y, measuredWidth, height) => {
      setAnchorRect({ x, y, width: measuredWidth, height });
    });
  }

  function openPopover() {
    syncAnchorPosition();
    onOpenChange(true);
  }

  function closePopover() {
    onOpenChange(false);
  }

  const popoverWidth =
    width ??
    Math.min(
      Math.max(anchorRect?.width ?? minWidth, minWidth),
      Math.min(maxWidth, viewportWidth - VIEWPORT_PADDING * 2),
    );
  const belowTop =
    (anchorRect?.y ?? VIEWPORT_PADDING) + (anchorRect?.height ?? 0) + offset;
  const belowSpace = viewportHeight - belowTop - VIEWPORT_PADDING;
  const popoverTop =
    belowSpace >= Math.min(220, estimatedHeight)
      ? belowTop
      : Math.max(
          VIEWPORT_PADDING,
          (anchorRect?.y ?? VIEWPORT_PADDING) - estimatedHeight - offset,
        );
  const preferredLeft =
    align === "end"
      ? (anchorRect?.x ?? VIEWPORT_PADDING) +
        (anchorRect?.width ?? 0) -
        popoverWidth
      : (anchorRect?.x ?? VIEWPORT_PADDING);
  const popoverLeft = Math.min(
    Math.max(preferredLeft, VIEWPORT_PADDING),
    viewportWidth - popoverWidth - VIEWPORT_PADDING,
  );
  const popoverMaxHeight = Math.max(
    220,
    viewportHeight - popoverTop - VIEWPORT_PADDING,
  );

  return (
    <>
      {trigger({
        anchorRef,
        openPopover,
        closePopover,
        isOpen: open,
      })}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closePopover}
      >
        <Pressable
          onPress={closePopover}
          className={cn("flex-1", backdropClassName)}
        >
          <Pressable
            onPress={() => {}}
            className={cn("absolute", contentClassName)}
            style={{
              top: popoverTop,
              left: popoverLeft,
              width: popoverWidth,
              maxHeight: popoverMaxHeight,
            }}
          >
            {children}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
