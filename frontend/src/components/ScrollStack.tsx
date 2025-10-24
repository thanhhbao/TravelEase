import React from "react";

type ScrollStackItem = {
  id: string | number;
  content: React.ReactNode;
};

type ScrollStackProps = {
  items: ScrollStackItem[];
  topOffset?: number;
  cardHeight?: number;
  overlapOffset?: number;
  motion?: "none" | "slide";
};

/**
 * Simple scroll stack inspired by reactbits ScrollStack.
 * Cards are sticky and cascade as you scroll through the container.
 */
export function ScrollStack({
  items,
  topOffset = 0,
  cardHeight = 320,
  overlapOffset = 56,
  motion = "none",
}: ScrollStackProps) {
  return (
    <div className="relative">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="relative"
          style={{
            minHeight: cardHeight,
            paddingTop: index === 0 ? 0 : overlapOffset,
          }}
        >
          <div className="sticky" style={{ top: topOffset + index * 12, zIndex: items.length - index }}>
            <div
              className={`transition-transform duration-500 ${
                motion === "slide" ? "animate-slide-left" : ""
              }`}
              style={{ animationDelay: motion === "slide" ? `${index * 0.15}s` : undefined }}
            >
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
