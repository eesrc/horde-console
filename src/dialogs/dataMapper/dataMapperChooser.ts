import { AVAILABLE_MAPPERS_TYPES } from "@exploratoryengineering/data-mapper-chain";
import { DialogController } from "aurelia-dialog";
import { autoinject } from "aurelia-framework";

@autoinject
export class NewDataMapper {
  availableMappers = AVAILABLE_MAPPERS_TYPES;

  constructor(private dialogController: DialogController) {}

  selectMapperType(type: string) {
    this.dialogController.ok(type);
  }
}
