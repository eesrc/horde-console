import { DialogController } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { LogBuilder } from "Helpers/LogBuilder";
import { FirmwareImage } from "Models/Firmware";
import { BadRequestError, CollectionService, ConflictError } from "Services/CollectionService";

const Log = LogBuilder.create("Edit firmware dialog");

interface IEditFirmwareDialogParams {
  firmware: FirmwareImage;
}

@autoinject
export class CreateCollectionDialog {
  headerText: string = "Update firmware image";
  confirmButtonText: string = "Update firmware image";

  firmwareImage: FirmwareImage = new FirmwareImage();

  isLoading: boolean = false;

  constructor(
    private collectionService: CollectionService,
    private dialogController: DialogController,
    private eventAggregator: EventAggregator,
  ) {}

  submitFirmware() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    Log.debug("Firmware to be submitted", this.firmwareImage);

    this.collectionService
      .updateCollectionFirmwareImage(this.firmwareImage)
      .then((firmwareImage) => {
        this.dialogController.ok(firmwareImage);
      })
      .catch((err) => {
        this.isLoading = false;

        if (err instanceof BadRequestError) {
          this.eventAggregator.publish("global:message", {
            body: `Bad request: ${err.content.message}`,
          });
        } else if (err instanceof ConflictError) {
          this.eventAggregator.publish("global:message", {
            body: `Conflict: ${err.content.message}`,
          });
        } else {
          Log.error("Error when trying to upload new firmware", err);
        }
      });
  }

  activate(args: IEditFirmwareDialogParams) {
    Log.debug("Activate args", args);

    this.firmwareImage = args.firmware;
  }
}
