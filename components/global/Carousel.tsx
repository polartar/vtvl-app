import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

import styles from "./Carousel.module.css";

interface CarouselItem {
  title: any;
  image: string;
  subtitle?: any;
  description?: any;
}

interface CarouselProps {
  variant?: "dark" | "light";
  items: CarouselItem[];
}

export const Carousel = ({
  variant = "dark",
  items = [],
  ...props
}: CarouselProps) => {
  const settings = {
    dots: true,
    arrows: false,
    autoplay: true,
    speed: 500,
    autoplaySpeed: 4000,
    appendDots: (dots: any) => (
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          bottom: "108px",
        }}
      >
        <ul style={{ padding: 0 }}> {dots} </ul>
      </div>
    ),
    dotsClass: styles.dots_custom,
  };

  return (
    <div
      className={`relative px-0 pt-3 pb-7 w-[448px] max-w-md max-h-full ${
        variant === "dark" ? "text-white" : "text-neutral-800"
      }`}
    >
      <Slider {...settings}>
        {items.map((item, itemIndex) => (
          <div
            key={`carousel-item-${itemIndex}-${item.title}`}
            className="p-6 flex flex-col items-center justify-center text-center"
          >
            <h3
              key={`carousel-item-heading-${itemIndex}`}
              className="font-medium leading-snug mx-auto h-20"
            >
              {item.title}
            </h3>
            <img
              src={item.image}
              className="max-w-sm h-40 mx-auto mt-9 mb-16"
              alt={item.subtitle}
            />
            {item.subtitle ? (
              <h3 className="text-sm font-bold mx-auto mb-2.5">
                {item.subtitle}
              </h3>
            ) : null}
            {item.description ? (
              <p
                className={`text-sm max-auto ${
                  variant === "dark" ? "text-neutral-300" : "text-neutral-500"
                }`}
              >
                {item.description}
              </p>
            ) : null}
          </div>
        ))}
      </Slider>
    </div>
  );
};
