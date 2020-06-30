import { autoinject } from "aurelia-framework";
import { BadRequestError, Collection, MqttOutput, OutputType } from "Services/CollectionService";
import { OutputDialog } from "./outputDialog";

interface ICreateOutputDialogParams {
  collection: Collection;
}

import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("Create output dialog");

@autoinject
export class CreateOutputDialog extends OutputDialog {
  headerText: string = "Create new output";
  confirmButtonText: string = "Create new output";

  formError: string = "";
  loading: boolean = false;

  submitOutput() {
    this.loading = true;
    this.collectionService
      .createCollectionOutput(this.output)
      .then((output) => {
        this.loading = false;
        this.dialogController.ok(output);
      })
      .catch((err: BadRequestError) => {
        if (err instanceof BadRequestError) {
          this.eventAggregator.publish("global:message", {
            body: `Bad request: ${err.content.message}`,
          });
          this.formError = err.content.message;
        } else {
          this.dialogController.cancel();
        }
        Log.error("Error when submitting output", err, this);
        this.loading = false;
      });
  }

  activate(args: ICreateOutputDialogParams) {
    this.output.collectionId = args.collection.id;

    this.subscription = this.bindingEngine
      .propertyObserver(this.output, "type")
      .subscribe((newType) => {
        this.typeChanged(newType);
      });
  }

  deactivate() {
    this.subscription.dispose();
  }

  private typeChanged(newType: OutputType) {
    this.output.config = {};

    if (newType === OutputType.mqtt) {
      (this.output as MqttOutput).config.certCheck = true;
    }
  }
}
