import { autoinject, observable, PLATFORM } from "aurelia-framework";
import { LogBuilder } from "Helpers/LogBuilder";
import { ConflictError, ForbiddenError, NotFoundError } from "Helpers/ResponseHandler";
import { FirmwareImage } from "Models/Firmware";
import { CollectionRoute } from "../../collection/collectionRoute";
import { FirmwareImageUsage } from "./../../../models/Firmware";

const Log = LogBuilder.create("FirmwareDetails");

interface ICollectionFirmwareDetailsActivationsParams {
  collectionId: string;
  firmwareImageId: string;
}

@autoinject
export class CollectionFirmware extends CollectionRoute {
  @observable
  firmwareImage: FirmwareImage = new FirmwareImage();
  firmwareUsage: FirmwareImageUsage;

  activate(params: ICollectionFirmwareDetailsActivationsParams) {
    return this.fetchCollectionRouteResources(params.collectionId)
      .then(async () => {
        this.firmwareImage = await this.collectionService.fetchCollectionFirmwareImage(
          this.collection,
          params.firmwareImageId,
        );
        this.firmwareUsage = await this.collectionService.fetchFirmwareUsage(this.firmwareImage);

        Log.debug("Activate", this.firmwareImage, this.firmwareUsage);
      })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          this.router.navigateToRoute("not-found");
        }
      });
  }

  editFirmwareImage() {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/firmware/editFirmwareDialog"),
        model: {
          firmware: new FirmwareImage({ ...this.firmwareImage }),
        },
      })
      .whenClosed(async (response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.eventAggregator.publish("global:message", {
            body: "Firmware image updated",
          });

          this.firmwareImage = response.output;
        }
      });
  }

  deleteFirmwareImage() {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/message/messageDialog"),
        model: {
          messageHeader: "Delete firmware image?",
          message: `Note: The image can't be in use. You need to either remove the devices using it or migrate to another firmware image`,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        },
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          Log.debug("Deleting firmware");
          this.collectionService
            .deleteCollectionFirmwareImage(this.firmwareImage)
            .then(() => {
              this.router.navigateToRoute("collection-firmware", {
                collectionId: this.collection.id,
              });
            })
            .catch((err) => {
              if (err instanceof ForbiddenError) {
                this.eventAggregator.publish("global:message", {
                  body: `Forbidden: You need to be admin to delete this resource`,
                });
              } else if (err instanceof ConflictError) {
                this.eventAggregator.publish("global:message", {
                  body: `Conflict: ${err.content.message}`,
                });
              } else {
                Log.error("Error when deleting firmware", err);
              }
            });
        } else {
          Log.debug("Did not delete firmware");
        }
      });
  }
}
