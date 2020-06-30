import { FirmwareDetails, FirmwareDetailsDto } from "./Firmware";

export enum ManagementType {
  disabled = "disabled",
  collection = "collection",
  device = "device",
}

interface CollectionFirmwareDetails extends FirmwareDetails {
  management: ManagementType;
}
interface CollectionFirmwareDetailsDto extends FirmwareDetailsDto {
  management: ManagementType;
}

interface ICollectionDto {
  collectionId: string;
  teamId: string;
  firmware: CollectionFirmwareDetailsDto;
  tags: { [tagName: string]: string };
}

export class Collection implements TagEntity {
  static newFromDto(collection: ICollectionDto): Collection {
    return new Collection({
      id: collection.collectionId,
      teamId: collection.teamId,
      firmware: collection.firmware,
      tags: collection.tags,
    });
  }

  static toDto(collection: Collection): ICollectionDto {
    return {
      collectionId: collection.id,
      teamId: collection.teamId,
      firmware: collection.firmware,
      tags: collection.tags,
    };
  }
  id: string;
  teamId: string;
  tags: { [tagName: string]: string };
  firmware: CollectionFirmwareDetails;

  constructor({
    id = "",
    teamId = "",
    tags = {},
    firmware = { management: ManagementType.disabled } as CollectionFirmwareDetails,
  } = {}) {
    this.id = id;
    this.teamId = teamId;

    if (!firmware.targetFirmwareId) {
      firmware.targetFirmwareId = "0";
    }

    this.firmware = firmware;
    this.tags = tags;
  }
}
