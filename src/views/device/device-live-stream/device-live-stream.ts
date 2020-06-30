import { Range } from "Helpers/Range";
import { NotFoundError } from "Helpers/ResponseHandler";
import { Device, DeviceDataMessage } from "Services/DeviceService";
import { CollectionRoute } from "../../collection/collectionRoute";

interface DeviceDetailsActivationParams {
  collectionId: string;
  deviceId: string;
}

export class DeviceStream extends CollectionRoute {
  device: Device;
  deviceMessages: DeviceDataMessage[] = [];
  collectionId: string;

  activate(params: DeviceDetailsActivationParams) {
    this.collectionId = params.collectionId;
    this.collectionStream.openCollectionDataStream(this.collectionId);

    return Promise.all([
      this.deviceService.fetchDeviceInCollection(params.collectionId, params.deviceId),
      this.fetchCollectionRouteResources(params.collectionId),
    ])
      .then(([device]) => {
        this.device = device;
        this.fetchDeviceData();
      })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          this.router.navigateToRoute("not-found");
        }
      });
  }

  deactivate() {
    this.collectionStream.closeCollectionStream();
  }

  selectedRangeChanged() {
    this.fetchDeviceData();
  }

  private async fetchDeviceData() {
    this.deviceMessages = await this.deviceService.fetchDeviceData(this.device, {
      since: Range.ONE_HOUR_AGO.value(),
      limit: 2000,
    });
  }
}
