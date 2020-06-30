import { PLATFORM } from "aurelia-framework";
import { Range } from "Helpers/Range";
import { NotFoundError } from "Helpers/ResponseHandler";
import { Device, DeviceDataMessage, ForbiddenError } from "Services/DeviceService";
import { CollectionRoute } from "../../collection/collectionRoute";

interface DeviceDetailsActivationParams {
  collectionId: string;
  deviceId: string;
}

import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("Device details");

export class DeviceDetails extends CollectionRoute {
  device: Device;
  deviceMessages: DeviceDataMessage[] = [];
  collectionId: string;

  editDevice() {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/device/editDeviceDialog"),
        model: {
          device: { ...this.device },
        },
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.eventAggregator.publish("global:message", {
            body: "Device updated",
          });
          this.device = response.output;
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
              this.router.navigateToRoute("collection-details", {
                collectionId: deviceToBeDeleted.collectionId,
              });
            })
            .catch((err) => {
              if (err instanceof ForbiddenError) {
                this.eventAggregator.publish("global:message", {
                  body: `Forbidden: You need to be admin to delete this resource`,
                });
              } else {
                Log.error("Error when deleting device", err);
              }
            });
        } else {
          Log.debug("Did not delete device");
        }
      });
  }

  addLocationTag({ latitude, longitude }) {
    this.deviceService
      .addTagToDevice(this.device, {
        key: "location",
        value: `${latitude},${longitude}`,
      })
      .then(() => {
        this.eventAggregator.publish("global:message", {
          body: "Added location to device",
        });
      })
      .catch((error) => {
        if (error instanceof ForbiddenError) {
          this.eventAggregator.publish("global:message", {
            body: `Forbidden: You need to be admin to add location tag`,
          });
        }
      });
  }

  activate(params: DeviceDetailsActivationParams) {
    this.collectionId = params.collectionId;
    this.collectionStream.openCollectionDataStream(this.collectionId);

    return Promise.all([
      this.deviceService.fetchDeviceInCollection(params.collectionId, params.deviceId),
      this.fetchCollectionRouteResources(params.collectionId),
    ])
      .then(([device]) => {
        this.device = device;
        this.fetchDeviceData();
      })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          this.router.navigateToRoute("not-found");
        }
      });
  }

  deactivate() {
    this.collectionStream.closeCollectionStream();
  }

  selectedRangeChanged() {
    this.fetchDeviceData();
  }

  private async fetchDeviceData() {
    this.deviceMessages = await this.deviceService.fetchDeviceData(this.device, {
      since: Range.ONE_HOUR_AGO.value(),
      limit: 2000,
    });
  }
}
