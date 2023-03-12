import Lottie from 'lottie-react';
import React from 'react';

interface IMediaAsset extends React.ImgHTMLAttributes<HTMLImageElement> {
  animated?: boolean;
}

/**
 * MediaAsset component is used to render either a STATIC IMAGE or an ANIMATED LOTTIE FILE
 * The purpose of this is to allow VTVL platform to handle white-label theming based on brands,
 * while maintaining the code as reusable as possible.
 * This will render a static image if provided with just the src and other default <img /> props
 * This will render an animated lottie file with same controls as using <Lottie />
 */

const MediaAsset = ({ animated = false, ...props }: IMediaAsset) => {
  return animated ? <Lottie animationData={props.src} {...props} /> : <img {...props} />;
};

export default MediaAsset;
