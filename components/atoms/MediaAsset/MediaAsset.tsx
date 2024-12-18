import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import React, { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface IMediaAsset extends React.ImgHTMLAttributes<HTMLImageElement> {
  animated?: boolean;
  animateOnHover?: boolean;
  active?: boolean;
  fallback?: string;
  // Applies class based on the condition given
  classOnComplete?: (condition: boolean) => string;
}

/**
 * MediaAsset component is used to render either a STATIC IMAGE or an ANIMATED LOTTIE FILE
 * The purpose of this is to allow VTVL platform to handle white-label theming based on brands,
 * while maintaining the code as reusable as possible.
 * This will render a static image if provided with just the src and other default <img /> props
 * This will render an animated lottie file with same controls as using <Lottie />
 */

const MediaAsset = ({ animated = false, animateOnHover = false, active = false, ...props }: IMediaAsset) => {
  const [animationData, setAnimationData] = useState(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [lottieError, setLottieError] = useState(false);

  // When hovering in to the asset, play the animation
  // continues to play on the last frame
  const handleHoverIn = () => {
    if (!active) {
      lottieRef?.current?.play();
    }
  };

  // When hovering out from the asset, pause the animation
  // which brings seamless UI animation as it stops on the last frame
  const handleHoverOut = () => {
    if (!active) {
      lottieRef?.current?.pause();
    }
  };

  // Load the animation file dynamically by getting the .src prop
  useEffect(() => {
    if (props.src && animated) {
      const loadAnimationData = async () => {
        try {
          const response = await fetch(props.src!);
          const data = await response.json();
          setAnimationData(data);
        } catch (error) {
          setLottieError(true);
        }
      };
      loadAnimationData();
    }
  }, [props.src]);

  // Checks for the active state
  useEffect(() => {
    if (active) lottieRef?.current?.play();
    else lottieRef?.current?.pause();
  }, [active]);

  // Render the lottie animation if needed,
  // render the static image by default
  // Apply necessary classes on complete
  return animated && !lottieError ? (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      autoplay={active}
      {...props}
      onMouseMove={handleHoverIn}
      onMouseOut={handleHoverOut}
      className={twMerge(props.className, props.classOnComplete ? props?.classOnComplete(true) : '')}
    />
  ) : (
    <img
      {...props}
      src={props.fallback && lottieError ? props.fallback : props.src}
      className={twMerge(props.className, props.classOnComplete ? props?.classOnComplete(false) : '')}
    />
  );
};

export default MediaAsset;
