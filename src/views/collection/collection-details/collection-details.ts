import { PLATFORM } from "aurelia-framework";
import { LogBuilder } from "Helpers/LogBuilder";
import { Time } from "Helpers/Time";
import { Device, DeviceDataMessage } from "Models/Device";
import { ConflictError, ForbiddenError } from "Services/CollectionService";
import { CollectionRoute } from "../collectionRoute";

const Log = LogBuilder.create("Collection details");

interface ICollectionDetailsActivationsParams {
  collectionId: string;
}

export class CollectionDetails extends CollectionRoute {
  collectionDeviceMessages: DeviceDataMessage[] = [];

  editCollection() {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/collection/editCollectionDialog"),
        model: {
          teams: this.teams,
          collection: { ...this.collection },
        },
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.eventAggregator.publish("global:message", {
            body: "Collection updated",
          });
          this.collection = response.output;
        }
      });
  }

  deleteCollection() {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/message/messageDialog"),
        model: {
          messageHeader: `Delete collection?`,
          message: `Note: Before you delete the collection you must first delete all devices and outputs connected to the collection.`,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        },
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.collectionService
            .deleteCollection(this.collection)
            .then(() => {
              this.eventAggregator.publish("global:message", {
                body: "Collection deleted",
              });
              this.router.navigateToRoute("collection-overview");
            })
            .catch((error) => {
              if (error instanceof ConflictError) {
                this.eventAggregator.publish("global:message", {
                  body: "Couldn't delete collection due to existing devices or outputs",
                });
              } else if (error instanceof ForbiddenError) {
                this.eventAggregator.publish("global:message", {
                  body: `Forbidden: You need to be admin to delete this collection`,
                });
              } else {
                Log.error("Error when trying to delete collection", error);
              }
            });
        }
      });
  }

  createDevice() {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/device/createDeviceDialog"),
        model: {
          collection: this.collection,
        },
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.eventAggregator.publish("global:message", {
            body: "Device added",
          });
          this.devices.push(response.output);
        }
      });
  }

  deleteDevice(deviceToBeDeleted: Device) {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/message/messageDialog"),
        model: {
          messageHeader: "Delete device?",
          message: `Are you sure you want to delete the device?`,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        },
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          Log.debug("Deleting device");
          this.deviceService
            .deletedevice(deviceToBeDeleted)
            .then(() => {
              this.devices = this.devices.filter((device) => {
                return device.id !== deviceToBeDeleted.id;
              });
              this.eventAggregator.publish("global:message", {
                body: "Device deleted",
              });
            })
            .catch((err) => {
              if (err instanceof ForbiddenError) {
                this.eventAggregator.publish("global:message", {
                  body: `Forbidden: You need to be admin to delete this device`,
                });
              } else {
                Log.error("Error when trying to delete device", err);
              }
            });
        } else {
          Log.debug("Did not delete device");
        }
      });
  }

  goToCollectionDevices() {
    this.router.navigateToRoute("collection-devices", {
      collectionId: this.collection.id,
    });
  }

  activate(params: ICollectionDetailsActivationsParams) {
    return this.fetchCollectionRouteResources(params.collectionId).then(async () => {
      this.collectionDeviceMessages = await this.collectionService.fetchDeviceMessagesByCollectionId(
        this.collection.id,
        {
          since: Time.ONE_HOUR_AGO(),
        },
      );
      this.collectionStream.openCollectionDataStream(this.collection.id);
    });
  }

  deactivate() {
    this.collectionStream.closeCollectionStream();
  }
}
