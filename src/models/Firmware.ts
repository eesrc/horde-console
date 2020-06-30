/*
	Copyright 2018 Telenor Digital AS

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

export interface FirmwareDetailsDto {
  targetFirmwareId?: string;
  currentFirmwareId?: string;
}

export interface FirmwareDetails {
  targetFirmwareId?: string;
  currentFirmwareId?: string;
}

export interface FirmwareImageUsageDto {
  firmwareId: string;
  targetedDevices: string[];
  currentDevices: string[];
}

interface DeviceUsage {
  id: string;
  targeted: boolean;
  current: boolean;
}
export interface FirmwareImageUsage {
  id: string;
  deviceList: DeviceUsage[];
  targetedDevices: number;
  currentDevices: number;
}

export interface FirmwareImageDto {
  imageId: string;
  version: string;
  filename: string;
  sha256: string;
  length: number;
  collectionId: string;
  created: number;
  tags: { [tagName: string]: string };
}

export interface FirmwareImageUpdate {
  version: string;
  tags: { [tagName: string]: string };
}

export class FirmwareImage implements TagEntity {
  static newFromDto(firmware: FirmwareImageDto): FirmwareImage {
    return new FirmwareImage({
      id: firmware.imageId,
      version: firmware.version,
      fileName: firmware.filename,
      sha256: firmware.sha256,
      size: firmware.length,
      collectionId: firmware.collectionId,
      created: firmware.created,
      tags: firmware.tags,
    });
  }

  static toDto(firmware: FirmwareImage): FirmwareImageDto {
    return {
      imageId: firmware.id,
      version: firmware.version,
      filename: firmware.fileName,
      sha256: firmware.sha256,
      length: firmware.size,
      collectionId: firmware.collectionId,
      created: firmware.created,
      tags: firmware.tags,
    };
  }

  static newFirmwareImageUsageFromDto(
    firmwareImageUsageDto: FirmwareImageUsageDto,
  ): FirmwareImageUsage {
    const devices = {};
    firmwareImageUsageDto.targetedDevices.forEach((target) => {
      devices[target] = {
        id: target,
        targeted: true,
        current: false,
      };
    });

    firmwareImageUsageDto.currentDevices.forEach((current) => {
      if (devices[current]) {
        devices[current].current = true;
        return;
      }

      devices[current] = {
        id: current,
        targeted: false,
        current: true,
      };
    });

    return {
      id: firmwareImageUsageDto.firmwareId,
      deviceList: Object.keys(devices).map((deviceId) => {
        return devices[deviceId];
      }),
      targetedDevices: firmwareImageUsageDto.targetedDevices.length,
      currentDevices: firmwareImageUsageDto.currentDevices.length,
    };
  }

  id: string;
  version: string;
  fileName: string;
  sha256: string;
  size: number;
  collectionId: string;
  created: number;
  tags: { [tagName: string]: string };

  constructor({
    id = "",
    version = "",
    fileName = "",
    sha256 = "",
    size = 0,
    collectionId = "",
    created = 0,
    tags = {},
  } = {}) {
    this.id = id;
    this.version = version;
    this.fileName = fileName;
    this.sha256 = sha256;
    this.size = size;
    this.collectionId = collectionId;
    this.created = created;
    this.tags = tags;
  }

  asUpdate(): FirmwareImageUpdate {
    return {
      version: this.version,
      tags: this.tags,
    };
  }
}
