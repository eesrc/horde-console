import { autoinject, observable, PLATFORM } from "aurelia-framework";
import { LogBuilder } from "Helpers/LogBuilder";
import { TagHelper } from "Helpers/TagHelper";
import { ManagementType } from "Models/Collection";
import { FirmwareImage } from "Models/Firmware";
import { ConflictError, ForbiddenError } from "Services/DeviceService";
import { CollectionRoute } from "../collectionRoute";

const Log = LogBuilder.create("Collections firmware");
const th = new TagHelper();

interface ICollectionDevicesActivationsParams {
  collectionId: string;
}

@autoinject
export class CollectionFirmware extends CollectionRoute {
  @observable
  firmwareImages: FirmwareImage[] = [];
  initialFirmwareManagement: ManagementType;
  initialFirmwareTargetId: string;

  availableManagementTypes = [
    {
      id: ManagementType.disabled,
      value: "Firmware management disabled",
    },
    {
      id: ManagementType.collection,
      value: "Collection wide firmware management",
    },
    {
      id: ManagementType.device,
      value: "Device based management",
    },
  ];

  availableFirmwareImages = [];

  isLoading: boolean = false;

  activate(params: ICollectionDevicesActivationsParams) {
    return this.fetchCollectionRouteResources(params.collectionId).then(async () => {
      this.firmwareImages = await this.collectionService.fetchCollectionFirmwareImages(
        this.collection,
      );

      this.initialFirmwareManagement = this.collection.firmware.management;
      this.initialFirmwareTargetId = this.collection.firmware.targetFirmwareId;
    });
  }

  updateCollectionFirmwareManagement() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.collectionService
      .updateCollectionFirmwareManagement(this.collection)
      .then((collection) => {
        this.collection = collection;
        this.initialFirmwareManagement = collection.firmware.management;
        this.initialFirmwareTargetId = collection.firmware.targetFirmwareId;
        this.isLoading = false;

        this.eventAggregator.publish("global:message", {
          body: `Collection firmware management updated`,
        });
      })
      .catch((err) => {
        if (err instanceof ForbiddenError) {
          this.eventAggregator.publish("global:message", {
            body: `Forbidden: You need to be admin to update this resource`,
          });
        } else {
          Log.error("Error when trying to update firmware management", err);
        }
        this.isLoading = false;
      });
  }

  uploadNewFirmwareImage() {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/firmware/createFirmwareDialog"),
        model: {
          collectionId: this.collection.id,
        },
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          Log.debug("Got response output", response.output);
          const newFirmwareImageList = [...this.firmwareImages];
          newFirmwareImageList.unshift(response.output);

          this.firmwareImages = newFirmwareImageList;
          Log.debug("Got response output", this.firmwareImages);

          this.eventAggregator.publish("global:message", {
            body: "Firmware created",
          });
        }
      });
  }

  editFirmwareImage(firmwareToEdit: FirmwareImage) {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/firmware/editFirmwareDialog"),
        model: {
          firmware: new FirmwareImage({ ...firmwareToEdit }),
        },
      })
      .whenClosed(async (response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.eventAggregator.publish("global:message", {
            body: "Firmware image updated",
          });

          this.firmwareImages = await this.collectionService.fetchCollectionFirmwareImages(
            this.collection,
          );
        }
      });
  }

  deleteFirmwareImage(firmwareToBeDeleted: FirmwareImage) {
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
            .deleteCollectionFirmwareImage(firmwareToBeDeleted)
            .then(() => {
              this.firmwareImages = this.firmwareImages.filter((firmwareImage) => {
                return firmwareImage.id !== firmwareToBeDeleted.id;
              });
              this.eventAggregator.publish("global:message", {
                body: "Firmware deleted",
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

  firmwareImagesChanged(firmwareImages: FirmwareImage[]) {
    this.availableFirmwareImages = firmwareImages.map((firmwareImage) => {
      return {
        id: firmwareImage.id,
        value: `${th.getEntityName(firmwareImage, "id")} (${firmwareImage.version})`,
      };
    });
    this.availableFirmwareImages.unshift({
      id: "0",
      value: "No target firmware",
    });
  }
}
