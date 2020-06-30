import { PLATFORM } from "aurelia-framework";
import { Device } from "Models/Device";
import { CollectionRoute } from "../collectionRoute";

interface ICollectionDevicesActivationsParams {
  collectionId: string;
}

import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("Collection devices");

export class CollectionDevices extends CollectionRoute {
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
          this.deviceService.deletedevice(deviceToBeDeleted).then(() => {
            this.devices = this.devices.filter((device) => {
              return device.id !== deviceToBeDeleted.id;
            });
            this.eventAggregator.publish("global:message", {
              body: "Device deleted",
            });
          });
        } else {
          Log.debug("Did not delete device");
        }
      });
  }

  activate(params: ICollectionDevicesActivationsParams) {
    return this.fetchCollectionRouteResources(params.collectionId);
  }
}
