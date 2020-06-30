import { create, DataMapperChain } from "@exploratoryengineering/data-mapper-chain";
import { bindable, PLATFORM } from "aurelia-framework";
import { LogBuilder } from "Helpers/LogBuilder";
import { Range } from "Helpers/Range";
import { ForbiddenError } from "Helpers/ResponseHandler";
import { DeviceDataMessage } from "Models/Device";
import { CollectionRoute } from "../collectionRoute";

const Log = LogBuilder.create("Collection visualization");

interface ICollectionDetailsActivationsParams {
  collectionId: string;
}

export class CollectionVisualization extends CollectionRoute {
  @bindable selectedRange: Range = Range.ONE_HOUR_AGO;

  dataMapperChains: DataMapperChain[] = [];
  collectionDeviceMessages: DeviceDataMessage[] = [];

  activate(params: ICollectionDetailsActivationsParams) {
    return this.fetchCollectionRouteResources(params.collectionId).then(async () => {
      this.collectionStream.openCollectionDataStream(this.collection.id);
      this.collectionDeviceMessages = await this.collectionService.fetchDeviceMessagesByCollectionId(
        this.collection.id,
        {
          since: this.selectedRange.value(),
        },
        true,
      );
      this.loadDataMapperChainFromCollection();
    });
  }

  deactivate() {
    this.collectionStream.closeCollectionStream();
  }

  createNewDataMapper() {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/dataMapper/createDataMapperChainDialog"),
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          this.dataMapperChains.push(response.output);
          this.saveDataMapperChainsToCollection(this.dataMapperChains);
        }
      });
  }

  editDataMapperChain(dataMapperChain: DataMapperChain) {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/dataMapper/editDataMapperChainDialog"),
        model: {
          dataMapperChain: dataMapperChain,
        },
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.dataMapperChains.splice(
            this.dataMapperChains.indexOf(dataMapperChain),
            1,
            response.output,
          );
          this.saveDataMapperChainsToCollection(this.dataMapperChains);
        }
      });
  }

  deleteDataMapperChain(dataMapperChain: DataMapperChain) {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/message/messageDialog"),
        model: {
          messageHeader: "Delete visualization?",
          message: `Are you sure you want to delete the visualization?`,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        },
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          this.dataMapperChains.splice(this.dataMapperChains.indexOf(dataMapperChain), 1);
          this.saveDataMapperChainsToCollection(this.dataMapperChains);
        }
      });
  }

  async selectedRangeChanged() {
    this.collectionDeviceMessages = await this.collectionService.fetchDeviceMessagesByCollectionId(
      this.collection.id,
      {
        since: this.selectedRange.value(),
        limit: 2000,
      },
      true,
    );
  }

  private async saveDataMapperChainsToCollection(mapperChains: DataMapperChain[]) {
    const tag: Tag = {
      key: "data-mapper-chain",
      value: window.btoa(JSON.stringify(mapperChains.map((chain) => chain.serializeConfig()))),
    };
    this.collectionService
      .addTagToCollection(this.collection, tag)
      .then(() => {
        this.dataMapperChains = mapperChains;
      })
      .catch((error) => {
        if (error instanceof ForbiddenError) {
          this.eventAggregator.publish("global:message", {
            body: `Forbidden: You need to be admin to save the data-mapper`,
          });
        } else {
          Log.error("Error when trying to add tag to collection", error);
        }
      });
  }

  private loadDataMapperChainFromCollection() {
    this.dataMapperChains = [];
    const dataMapperChainTag = this.collection.tags["data-mapper-chain"];
    if (dataMapperChainTag) {
      const dataMappersDecoded = window.atob(dataMapperChainTag);
      if (Array.isArray(JSON.parse(dataMappersDecoded))) {
        this.dataMapperChains = JSON.parse(dataMappersDecoded).map((mapperConfig) => {
          return create().loadConfig(mapperConfig);
        });
      } else {
        this.dataMapperChains = [create().loadConfig(dataMappersDecoded)];
      }
    }
  }
}
