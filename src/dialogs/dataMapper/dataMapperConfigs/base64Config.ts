import { IMapper } from "@exploratoryengineering/data-mapper-chain";
import { bindable, bindingMode } from "aurelia-framework";

export class Base64Config {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) mapper: IMapper;
}
