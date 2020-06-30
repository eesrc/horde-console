import { autoinject, bindable } from "aurelia-framework";
import { CollectionService, Output, OutputLogEntry } from "Services/CollectionService";

@autoinject
export class OutputLog {
  @bindable output: Output;

  outputLogs: OutputLogEntry[] = [];
  loading: boolean = false;

  constructor(private collectionService: CollectionService) {}

  bind() {
    this.fetchOutputLogs();
  }

  fetchOutputLogs() {
    if (this.output.enabled) {
      this.loading = true;
      this.collectionService.getCollectionOutputLogs(this.output).then((outputLog) => {
        this.outputLogs = outputLog.logs;
        this.loading = false;
      });
    }
  }
}
