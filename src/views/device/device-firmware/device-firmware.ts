import { computedFrom, observable } from "aurelia-framework";
import { LogBuilder } from "Helpers/LogBuilder";
import { ForbiddenError, NotFoundError } from "Helpers/ResponseHandler";
import { TagHelper } from "Helpers/TagHelper";
import { FirmwareImage } from "Models/Firmware";
import { Device, DeviceDataMessage } from "Services/DeviceService";
import { CollectionRoute } from "../../collection/collectionRoute";

interface DeviceDetailsActivationParams {
  collectionId: string;
  deviceId: string;
}

const propNames = {
  currentFirmareId: "Current firmware ID",
  targetFirmwareId: "Target firmware ID",
  firmwareVersion: "Firmware version",
  serialNumber: "Serial number",
  manufacturer: "Manufacturer",
  modelNumber: "Model number",
  state: "State",
  stateMessage: "State message",
};

const th = new TagHelper();
const Log = LogBuilder.create("Device firmware");

export class DeviceFirmware extends CollectionRoute {
  device: Device = new Device();
  deviceMessages: DeviceDataMessage[] = [];
  collectionId: string;

  @observable
  firmwareImages: FirmwareImage[] = [];

  availableFirmwareImages = [];

  initialFirmwareTargetId: string = "";

  isLoading: boolean = false;

  deviceIntervalPollingId: number = 0;
  deviceIntervalPollingTimeout: number = 5000;

  activate(params: DeviceDetailsActivationParams) {
    this.deviceIntervalPollingId = window.setInterval(() => {
      this.refreshFirmwareState();
    }, this.deviceIntervalPollingTimeout);

    return Promise.all([
      this.deviceService.fetchDeviceInCollection(params.collectionId, params.deviceId),
      this.fetchCollectionRouteResources(params.collectionId),
    ])
      .then(async ([device]) => {
        this.device = device;
        this.initialFirmwareTargetId = device.firmware.targetFirmwareId || "";

        this.firmwareImages = await this.collectionService.fetchCollectionFirmwareImages(
          this.collection,
        );

        Log.debug("Collection management", this.collection.firmware.management);
      })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          this.router.navigateToRoute("not-found");
        }
      });
  }

  deactivate() {
    window.clearInterval(this.deviceIntervalPollingId);
  }

  refreshFirmwareState() {
    if (!this.device) {
      return;
    }
    this.deviceService
      .fetchDeviceInCollection(this.device.collectionId, this.device.id)
      .then((device) => {
        // We avoid mutating the targetFirmwareId as we can disturb the user selecting a firmware
        // However we want to mutate the initial firmware image to show that the selected image might be
        // out of sync
        this.initialFirmwareTargetId = device.firmware.targetFirmwareId;
        device.firmware.targetFirmwareId = this.device.firmware.targetFirmwareId;
        this.device = device;
      })
      .catch((err) => {
        Log.warn("Failed to refresh state due to error", err);
        window.clearInterval(this.deviceIntervalPollingId);
      });
  }

  @computedFrom("device")
  get extraDetails() {
    return Object.entries(this.device.firmware)
      .map(([key, value]) => {
        return {
          key: this.propToFriendlyName(key),
          value,
        };
      })
      .filter((entry) => {
        return !!entry.value;
      });
  }

  updateDeviceFirmwareTarget() {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;

    this.deviceService
      .updateDeviceFirmwareTarget(this.device)
      .then((updatedDevice) => {
        this.isLoading = false;
        this.device = updatedDevice;
        this.initialFirmwareTargetId = updatedDevice.firmware.targetFirmwareId;
      })
      .catch((_: ForbiddenError) => {
        this.eventAggregator.publish("global:message", {
          body: `Forbidden: You need to be admin to update this resource`,
        });
        this.isLoading = false;
      })
      .catch((err) => {
        Log.error("Error when trying to update device firmware", err);
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

  propToFriendlyName(propName: string): string {
    return propNames[propName] ? propNames[propName] : propName;
  }
}
