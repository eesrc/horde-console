import { DialogController } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, PLATFORM, useView } from "aurelia-framework";

import { Collection } from "Models/Collection";
import {
  BadRequestError,
  ConflictError,
  Device,
  DeviceService,
  ForbiddenError,
} from "Services/DeviceService";

import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("Create device dialog");

interface ICreateDeviceDialogParams {
  collection: Collection;
}

@autoinject
@useView(PLATFORM.moduleName("dialogs/device/deviceDialog.html"))
export class CreateDeviceDialog {
  headerText: string = "Create new device";
  confirmButtonText: string = "Create device";

  formError: string = "";
  imeiError: string = "";
  imsiError: string = "";
  loading: boolean = false;

  collection: Collection;
  device: Device = new Device();

  constructor(
    private dialogController: DialogController,
    private deviceService: DeviceService,
    private eventAggregator: EventAggregator,
  ) {}

  submitDevice() {
    Log.debug("Device to be submitted", this.device);
    this.formError = "";
    if (!this.validate()) {
      return;
    }

    this.loading = true;
    this.deviceService
      .createNewDevice(this.device)
      .then((device) => {
        this.loading = false;
        this.dialogController.ok(device);
      })
      .catch((err: BadRequestError | ConflictError | ForbiddenError) => {
        if (err instanceof BadRequestError) {
          this.eventAggregator.publish("global:message", {
            body: `Bad request: ${err.content.message}`,
          });
          this.formError = err.content.message;
        } else if (err instanceof ConflictError) {
          this.eventAggregator.publish("global:message", {
            body: `Conflict: ${err.content.message}`,
          });
          this.formError = "A device with the given imsi or imei already exists.";
        } else if (err instanceof ForbiddenError) {
          this.eventAggregator.publish("global:message", {
            body: `Forbidden: You need to be admin to create device`,
          });
        } else {
          Log.error("Error when trying to delete device", err);
          this.dialogController.cancel();
        }

        this.loading = false;
      });
  }

  activate(params: ICreateDeviceDialogParams) {
    this.collection = params.collection;
    this.device.collectionId = this.collection.id;
  }

  private validate(): boolean {
    let validate: boolean = true;

    if (!this.device.imsi) {
      this.imsiError = "IMSI is required";
      validate = false;
    }

    if (!this.device.imei) {
      this.imeiError = "IMEI is required";
      validate = false;
    }

    return validate;
  }
}
