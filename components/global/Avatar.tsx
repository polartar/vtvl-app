import React from "react";

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Image url */
  src?: string;
  /** Name of the image. Can be used for initials placeholder */
  name: string;
  /** Placeholder type if the src is not provided or 404 */
  placeholder?: "initials" | "icon";
  /** Size */
  size?: "small" | "default" | "large";
  /** Any other `<img />` attributes */
}

export const Avatar = ({
  src = "",
  name = "",
  placeholder = "initials",
  size = "default",
  ...props
}: AvatarProps) => {
  const [loaded, setLoaded] = React.useState(true);
  const initials = name
    .trim()
    .split(" ")
    .map((n) => n.charAt(0))
    .join("");
  return (
    <div className={`avatar ${placeholder} ${size}`}>
      {loaded && src ? (
        <img src={src} alt={name} onError={() => setLoaded(false)} />
      ) : (
        <div className="text">{initials}</div>
      )}
    </div>
  );
};
