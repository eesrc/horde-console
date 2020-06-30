import { DialogController } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, observable } from "aurelia-framework";
import { LogBuilder } from "Helpers/LogBuilder";
import { FirmwareImage } from "Models/Firmware";
import { BadRequestError, CollectionService, ConflictError } from "Services/CollectionService";

const Log = LogBuilder.create("Create firmware dialog");

interface ICreateFirmwareDialogParams {
  collectionId: string;
}

@autoinject
export class CreateCollectionDialog {
  headerText: string = "Upload new firmware";
  confirmButtonText: string = "Upload firmware";

  firmwareImage: FirmwareImage = new FirmwareImage();

  firmwareUploadForm: HTMLFormElement;
  firmwareUploadFileElement: HTMLInputElement;
  @observable
  firmwareUploadFileName: string;
  firmwareSize: number = 0;

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
    const formData = new FormData(this.firmwareUploadForm);

    this.collectionService
      .createCollectionFirmwareImage(this.firmwareImage, formData)
      .then((newFirmwareImage) => {
        Log.debug("Successfully uploaded new firmware", newFirmwareImage);
        Log.debug("Updating with metadata");

        this.firmwareImage.id = newFirmwareImage.id;
        if (this.firmwareImage.version.trim() === "") {
          this.firmwareImage.version = newFirmwareImage.version;
        }
        return this.collectionService.updateCollectionFirmwareImage(this.firmwareImage);
      })
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

  activate(args: ICreateFirmwareDialogParams) {
    Log.debug("Activate args", args);

    this.firmwareImage.collectionId = args.collectionId;
  }

  firmwareUploadFileNameChanged() {
    this.firmwareSize = this.firmwareUploadFileElement.files[0].size;
  }
}
