import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import styles from './Carousel.module.css';

interface CarouselItem {
  title: any;
  image: string;
  subtitle?: any;
  description?: any;
}

interface CarouselProps {
  variant?: 'dark' | 'light';
  items?: CarouselItem[];
}

const defaultCarouselItems: CarouselItem[] = [
  {
    title: (
      <>
        100% <strong key="title-strong-1">no-code</strong>
        <br key="title-break-1" />
        ready in minutes
      </>
    ),
    image: '/images/how-it-works/1.png',
    subtitle: 'Mint or bring your own token',
    description: 'Variable or fixed supply? No problem, you have options.'
  },
  {
    title: (
      <>
        Create multiple <strong key="title-strong-2">vesting smart contracts</strong> in just a few clicks
      </>
    ),
    image: '/images/how-it-works/2.png',
    subtitle: 'Generate smart contracts for investors & employees',
    description: 'We get it, have your engineers build YOUR product and let us take care of the custom vesting systems'
  },
  {
    title: (
      <>
        Automate <strong key="title-strong-3">custom token</strong> distributions to your holders
      </>
    ),
    image: '/images/how-it-works/3.png',
    subtitle: 'Track your own tokens',
    description: 'Say goodbye to managing via spreadsheet.'
  },
  {
    title: (
      <>
        Token vesting analytics <br key="title-break-4" />
        <strong key="title-strong-4">coming soon!</strong>
      </>
    ),
    image: '/images/how-it-works/4.png',
    subtitle: 'Token analytics coming soon',
    description: 'What you really want to know about your tokenomics.'
  }
];

const Carousel = ({ variant = 'dark', items = defaultCarouselItems, ...props }: CarouselProps) => {
  const settings = {
    dots: true,
    arrows: false,
    autoplay: true,
    speed: 500,
    autoplaySpeed: 4000,
    appendDots: (dots: any) => (
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: '379px'
        }}>
        <ul style={{ padding: 0 }}> {dots} </ul>
      </div>
    ),
    dotsClass: styles.dots_custom
  };

  return (
    <div
      className={`relative px-0 pt-3 pb-7 w-[448px] max-w-md max-h-full ${
        variant === 'dark' ? 'text-white' : 'text-neutral-800'
      }`}>
      <Slider {...settings}>
        {items.map((item, itemIndex) => (
          <div
            key={`carousel-item-${itemIndex}-${item.title}`}
            className="p-6 flex flex-col items-center justify-center text-center">
            <h3
              key={`carousel-item-heading-${itemIndex}`}
              className="font-medium leading-snug mx-auto h-20 max-h-[80px]">
              {item.title}
            </h3>
            <img src={item.image} className="w-auto h-56 max-h-[224px] mx-auto mt-4 mb-16" alt={item.subtitle} />
            {item.subtitle ? <h3 className="text-sm font-bold mx-auto mb-2.5">{item.subtitle}</h3> : null}
            {item.description ? (
              <p className={`text-sm max-auto ${variant === 'dark' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                {item.description}
              </p>
            ) : null}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
