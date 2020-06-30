import { DataMapperChain } from "@exploratoryengineering/data-mapper-chain";
import { PLATFORM, useView } from "aurelia-framework";
import { DataMapperChainDialog } from "./dataMapperChainDialog";

interface EditDataMapperChainActivationParams {
  dataMapperChain: DataMapperChain;
}

@useView(PLATFORM.moduleName("dialogs/dataMapper/dataMapperChainDialog.html"))
export class EditDataMapperChainDialog extends DataMapperChainDialog {
  heading = "Edit data mapper";
  confirmButtonText = "Update data mapper";

  activate(params: EditDataMapperChainActivationParams) {
    this.dataMapper = params.dataMapperChain;
    this.mappers = this.dataMapper.mappers;
    this.dataMapperName = this.dataMapper.name;
    this.visualizationType = this.dataMapper.meta
      ? this.dataMapper.meta["visualization-type"] || "graph"
      : "graph";
  }
}
