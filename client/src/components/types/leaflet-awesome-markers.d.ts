import * as L from "leaflet";

declare module "leaflet" {
  namespace AwesomeMarkers {
    interface IconOptions extends L.IconOptions {
      icon: string;
      prefix?: string;
      markerColor?: string;
      spin?: boolean;
      extraClasses?: string;
    }

    function icon(options: IconOptions): L.Icon;
  }

  export const AwesomeMarkers: typeof AwesomeMarkers;
}
