import * as React from "react";

import { ISvgIcons } from "./type";

export const PlaneNewIcon: React.FC<ISvgIcons> = ({
  width = "16",
  height = "16",
  className,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 16 16"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10.3619 10.3629V12.8365C10.3619 13.8272 9.558 14.6303 8.56809 14.6303H3.17377C2.1831 14.6303 1.38 13.8272 1.38 12.8365V7.44221C1.38 6.45077 2.1831 5.64844 3.17377 5.64844H5.64738V8.56915C5.64738 9.55982 6.45048 10.3629 7.44115 10.3629H10.3619Z"
      fill={color}
    />
    <path
      d="M14.6292 3.17365V8.56797C14.6292 9.55864 13.8261 10.3617 12.8355 10.3617H10.3626V7.44103C10.3626 6.44959 9.55876 5.64726 8.56886 5.64726H5.64815V3.17365C5.64815 2.18298 6.45125 1.37988 7.44192 1.37988H12.8362C13.8277 1.37988 14.6292 2.18375 14.6292 3.17365Z"
      fill={color}
    />
  </svg>
);
