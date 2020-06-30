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
import { FirmwareDetails, FirmwareDetailsDto } from "./Firmware";

export enum FirmwareStateType {
  initializing = "Initializing",
  current = "Current",
  pending = "Pending",
  downloading = "Downloading",
  completed = "Completed",
  updateFailed = "UpdateFailed",
  timedOut = "TimedOut",
  reverted = "Reverted",
  unknown = "Unknown",
}

interface DeviceFirmwareDetails extends FirmwareDetails {
  state: FirmwareStateType;
}
interface DeviceFirmwareDetailsDto extends FirmwareDetailsDto {
  state: FirmwareStateType;
}

export interface DeviceDto {
  deviceId: string;
  collectionId: string;
  imei: string;
  imsi: string;
  firmware?: DeviceFirmwareDetailsDto;
  tags: { [tagName: string]: string };
}

export interface DeviceDataMessage {
  type: "data";
  device: DeviceDto;
  payload: string;
  received: number;
  transport: "udp" | "coap-push" | "coap-pull";
}

export interface DeviceCOAPMessage extends DeviceDataMessage {
  transport: "coap-push" | "coap-pull";
  coapMetaData?: {
    code: "POST";
    path: string;
  };
}

export interface DeviceUDPMessage extends DeviceDataMessage {
  transport: "udp";
  udpMetaData?: {
    localPort: number;
    remotePort: number;
  };
}

export interface DownstreamMessage {
  port: number;
  payload: string;
  transport: "udp" | "coap-push" | "coap-pull";
  coapPath?: string;
}

export class Device implements TagEntity {
  static newFromDto(device: DeviceDto): Device {
    return new Device({
      id: device.deviceId,
      collectionId: device.collectionId,
      imei: device.imei,
      imsi: device.imsi,
      firmware: device.firmware,
      tags: device.tags,
    });
  }

  static toDto(device: Device): DeviceDto {
    return {
      deviceId: device.id,
      collectionId: device.collectionId,
      imei: device.imei,
      imsi: device.imsi,
      tags: device.tags,
    };
  }

  id: string;
  collectionId: string;
  imei: string;
  imsi: string;
  firmware: DeviceFirmwareDetails;
  tags: { [tagName: string]: string };

  constructor({
    id = "",
    collectionId = "",
    imei = "",
    imsi = "",
    tags = {},
    firmware = {
      state: FirmwareStateType.unknown,
    } as DeviceFirmwareDetails,
  } = {}) {
    this.id = id;
    this.collectionId = collectionId;
    this.imei = imei;
    this.imsi = imsi;

    if (!firmware.state) {
      firmware.state = FirmwareStateType.unknown;
    }

    if (!firmware.targetFirmwareId) {
      firmware.targetFirmwareId = "0";
    }

    this.firmware = firmware;
    this.tags = tags;
  }
}
