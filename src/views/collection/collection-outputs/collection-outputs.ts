import { PLATFORM } from "aurelia-framework";
import { CollectionRoute } from "../collectionRoute";

import { LogBuilder } from "Helpers/LogBuilder";
import { ForbiddenError, Output } from "Services/CollectionService";
const Log = LogBuilder.create("Collection outputs");

interface ICollectionOutputsActivationParams {
  collectionId: string;
}

export class CollectionOutputs extends CollectionRoute {
  outputs: Output[] = [];

  createOutput() {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/output/createOutputDialog"),
        model: {
          collection: this.collection,
        },
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.eventAggregator.publish("global:message", {
            body: "Output added",
          });
          this.outputs.push(response.output);
        }
      });
  }

  editOutput(outputToBeEdited) {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/output/editOutputDialog"),
        model: {
          output: Output.clone(outputToBeEdited),
        },
      })
      .whenClosed(async (response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.eventAggregator.publish("global:message", {
            body: "Output edited",
          });
          this.outputs = await this.collectionService.fetchCollectionOutputs(this.collection);
        }
      });
  }

  deleteOutput(outputToBeDeleted) {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/message/messageDialog"),
        model: {
          messageHeader: "Delete output?",
          message: `Are you sure you want to delete the output?`,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        },
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          Log.debug("Deleting output");
          this.collectionService
            .deleteCollectionOutput(outputToBeDeleted)
            .then(() => {
              this.outputs = this.outputs.filter((output) => {
                return output.id !== outputToBeDeleted.id;
              });
              this.eventAggregator.publish("global:message", {
                body: "Output deleted",
              });
            })
            .catch((err: ForbiddenError) => {
              if (err instanceof ForbiddenError) {
                this.eventAggregator.publish("global:message", {
                  body: `Forbidden: You need to be admin to delete this resource`,
                });
              } else {
                Log.error("Error when deleting output", err);
              }
            });
        } else {
          Log.debug("Did not delete output");
        }
      });
  }

  activate(params: ICollectionOutputsActivationParams) {
    return Promise.all([this.fetchCollectionRouteResources(params.collectionId)]).then(async () => {
      this.outputs = await this.collectionService.fetchCollectionOutputs(this.collection);
      Log.debug("Outputs:", this.outputs);
    });
  }
}
