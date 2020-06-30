import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable } from "aurelia-framework";
import { Output } from "Models/Output";
import { CollectionService, ForbiddenError, NotFoundError } from "Services/CollectionService";

const outputNames = {
  webhook: "Webhook",
  ifttt: "IFTTT",
  mqtt: "MQTT",
  udp: "UDP",
};

@autoinject
export class CollectionOutputList {
  @bindable outputs: Output[] = [];

  @bindable editOutputCallback;
  @bindable deleteOutputCallback;

  loadingToggle: boolean = false;

  constructor(
    private collectionService: CollectionService,
    private eventAggregator: EventAggregator,
  ) {}

  getOutputPrettyName(outputType: string) {
    return outputNames[outputType];
  }

  toggleOutputEnabled(output: Output) {
    this.loadingToggle = true;
    output.enabled = !output.enabled;
    this.collectionService
      .updateCollectionOutput(output)
      .then((updatedOutput) => {
        this.loadingToggle = false;
        this.eventAggregator.publish("global:message", {
          body: `${updatedOutput.enabled ? "Enabled" : "Disabled"} output`,
        });
      })
      .catch((error) => {
        output.enabled = !output.enabled;
        this.loadingToggle = false;

        if (error instanceof NotFoundError || error instanceof ForbiddenError) {
          this.eventAggregator.publish("global:message", {
            body: `Forbidden: You need to be admin to enable/disabled outputs`,
          });
        } else {
          this.eventAggregator.publish("global:message", {
            body: `An unknown error occured then trying to update output`,
          });
        }
      });
  }

  editOutput(output) {
    this.editOutputCallback({
      output: output,
    });
  }

  deleteOutput(output) {
    this.deleteOutputCallback({
      output: output,
    });
  }
}
