import { DialogController } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, BindingEngine, Disposable } from "aurelia-framework";
import { CollectionService, Output, OutputType } from "Services/CollectionService";

@autoinject
export class OutputDialog {
  protected output: Output = new Output();
  protected availableTypes = [
    {
      id: OutputType.webhook,
      value: "HTTP Webhook",
    },
    {
      id: OutputType.mqtt,
      value: "MQTT",
    },
    {
      id: OutputType.ifttt,
      value: "IfThisThenThat (IFTTT)",
    },
    {
      id: OutputType.udp,
      value: "UDP",
    },
  ];

  protected subscription: Disposable;

  constructor(
    protected collectionService: CollectionService,
    protected dialogController: DialogController,
    protected eventAggregator: EventAggregator,
    protected bindingEngine: BindingEngine,
  ) {}
}
