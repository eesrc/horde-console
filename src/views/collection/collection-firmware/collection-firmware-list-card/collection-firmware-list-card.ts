import { bindable, containerless } from "aurelia-framework";
import { FirmwareImage } from "Models/Firmware";

@containerless
export class CollectionFirmwareListCard {
  @bindable firmwareImages: FirmwareImage[] = [];
  filteredFirmwareImages: FirmwareImage[] = [];

  @bindable editFirmwareImageCallback;
  @bindable deleteFirmwareImageCallback;

  filteredFirmwareImagesCallback(filteredFirmwareImages: FirmwareImage[]) {
    this.filteredFirmwareImages = filteredFirmwareImages;
  }

  editFirmwareImage(firmwareImage: FirmwareImage) {
    this.editFirmwareImageCallback({
      firmwareImage: firmwareImage,
    });
  }

  deleteFirmwareImage(firmwareImage: FirmwareImage) {
    this.deleteFirmwareImageCallback({
      firmwareImage: firmwareImage,
    });
  }
}
