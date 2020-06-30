import { autoinject } from "aurelia-framework";
import { BadRequestError, Collection, ForbiddenError, Output } from "Services/CollectionService";
import { OutputDialog } from "./outputDialog";

interface ICreateOutputDialogParams {
  collection: Collection;
  output: Output;
}

import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("Edit output dialog");

@autoinject
export class EditOutputDialog extends OutputDialog {
  headerText: string = "Edit output";
  confirmButtonText: string = "Update output";

  formError: string = "";
  loading: boolean = false;

  submitOutput() {
    this.loading = true;
    this.collectionService
      .updateCollectionOutput(this.output)
      .then((output) => {
        this.loading = false;
        this.dialogController.ok(output);
      })
      .catch((err: BadRequestError | ForbiddenError) => {
        this.loading = false;

        if (err instanceof BadRequestError) {
          this.eventAggregator.publish("global:message", {
            body: `Bad request: ${err.content.message}`,
          });
          this.formError = err.content.message;
        } else if (err instanceof ForbiddenError) {
          this.eventAggregator.publish("global:message", {
            body: `Forbidden: You need to be admin to edit this output`,
          });
        } else {
          Log.error("Error when trying to edit output", err);
          this.dialogController.cancel();
        }
      });
  }

  activate(args: ICreateOutputDialogParams) {
    this.output = args.output;
  }
}
