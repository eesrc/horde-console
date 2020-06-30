import { bindable, computedFrom, containerless } from "aurelia-framework";
import { TnCustomComponent } from "Components/TnCustomComponent";

@containerless
export class TnSpinner extends TnCustomComponent {
  @bindable strokeWidth: string = "2";
  @bindable small: boolean | string = false;
  @bindable large: boolean | string = false;
  @bindable colored: boolean | string = false;

  @computedFrom("small", "large")
  get spinner() {
    if (this.hasProp("small")) {
      return {
        size: "23px",
        viewBox: "0 0 24 24",
        circle: {
          x: "12",
          y: "12",
          r: "9",
        },
      };
    } else if (this.hasProp("large")) {
      return {
        size: "65px",
        viewBox: "0 0 66 66",
        circle: {
          x: "33",
          y: "33",
          r: "30",
        },
      };
    } else {
      return {
        size: "33px",
        viewBox: "0 0 34 34",
        circle: {
          x: "17",
          y: "17",
          r: "14",
        },
      };
    }
  }
}
