import { IMapper } from "@exploratoryengineering/data-mapper-chain";
import { autoinject, bindable } from "aurelia-framework";

@autoinject
export class DataMapper {
  @bindable dataMapper: IMapper;
}
