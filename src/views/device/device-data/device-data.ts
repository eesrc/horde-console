import { bindable } from "aurelia-framework";
import { Range } from "Helpers/Range";
import { NotFoundError } from "Helpers/ResponseHandler";
import { Device, DeviceDataMessage } from "Services/DeviceService";
import { CollectionRoute } from "../../collection/collectionRoute";

interface DeviceDetailsActivationParams {
  collectionId: string;
  deviceId: string;
}

export class DeviceData extends CollectionRoute {
  @bindable selectedRange: string = Range.ONE_HOUR_AGO.id;
  @bindable selectedNumberOfMessages: string = "100";

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

  selectedNumberOfMessagesChanged() {
    this.fetchDeviceData();
  }

  private async fetchDeviceData() {
    this.deviceMessages = await this.deviceService.fetchDeviceData(this.device, {
      since: this.getRangeFromId(this.selectedRange).value(),
      limit: parseInt(this.selectedNumberOfMessages, 10),
    });
  }

  private getRangeFromId(rangeId: string): Range {
    switch (rangeId) {
      case Range.ONE_HOUR_AGO.id: {
        return Range.ONE_HOUR_AGO;
      }
      case Range.LAST_SIX_HOURS.id: {
        return Range.LAST_SIX_HOURS;
      }
      case Range.LAST_TWENTY_FOUR_HOURS.id: {
        return Range.LAST_TWENTY_FOUR_HOURS;
      }
      case Range.ALL.id: {
        return Range.ALL;
      }
      default: {
        return Range.ONE_HOUR_AGO;
      }
    }
  }
}
