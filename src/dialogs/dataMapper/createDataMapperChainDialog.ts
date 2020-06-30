import { PLATFORM, useView } from "aurelia-framework";
import { DataMapperChainDialog } from "./dataMapperChainDialog";

@useView(PLATFORM.moduleName("dialogs/dataMapper/dataMapperChainDialog.html"))
export class CreateDataMapperChainDialog extends DataMapperChainDialog {
  heading = "Create new data mapper";
  confirmButtonText = "Create data mapper";
}
