import { DialogController } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, PLATFORM, useView } from "aurelia-framework";

import {
  BadRequestError,
  ConflictError,
  Device,
  DeviceService,
  ForbiddenError,
} from "Services/DeviceService";

import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("Create device dialog");

interface IEditDeviceDialogParams {
  device: Device;
}

@autoinject
@useView(PLATFORM.moduleName("dialogs/device/deviceDialog.html"))
export class EditDeviceDialog {
  headerText: string = "Edit device";
  confirmButtonText: string = "Update device";

  formError: string = "";
  imeiError: string = "";
  imsiError: string = "";
  loading: boolean = false;

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
      .updateDevice(this.device)
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
            body: `Forbidden: You need to be admin to edit this device`,
          });
        } else {
          this.dialogController.cancel();
        }
        Log.error("Error when trying to edit device", err);
        this.loading = false;
      });
  }

  activate(params: IEditDeviceDialogParams) {
    this.device = params.device;
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
