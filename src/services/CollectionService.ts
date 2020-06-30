import { autoinject } from "aurelia-framework";
import { format } from "date-fns";
import { ApiClient } from "Helpers/ApiClient";
import { Collection } from "Models/Collection";
import { DeviceDataMessage } from "Models/Device";
import { FirmwareImage, FirmwareImageDto } from "Models/Firmware";
import { Output, OutputLogs, OutputStatus } from "Models/Output";

export * from "Models/Collection";
export * from "Models/Output";
export {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "Helpers/ResponseHandler";

export interface CollectionMessage {
  payload: string;
  port: number;
}

@autoinject
export class CollectionService {
  constructor(private apiClient: ApiClient) {}

  fetchAllCollections(): Promise<Collection[]> {
    return this.apiClient.http
      .get("/collections")
      .then((data) => data.content.collections)
      .then((collections) => collections.map(Collection.newFromDto));
  }

  fetchCollectionById(id: string): Promise<Collection> {
    return this.apiClient.http
      .get(`/collections/${id}`)
      .then((data) => data.content)
      .then((collectionDto) => Collection.newFromDto(collectionDto));
  }

  createNewCollection(collection: Collection): Promise<Collection> {
    return this.apiClient.http
      .post("/collections", Collection.toDto(collection))
      .then((data) => data.content)
      .then((collectionDto) => Collection.newFromDto(collectionDto));
  }

  updateCollection(collection: Collection): Promise<Collection> {
    return this.apiClient.http
      .patch(`/collections/${collection.id}`, Collection.toDto(collection))
      .then((data) => data.content)
      .then((collectionDto) => Collection.newFromDto(collectionDto));
  }

  addTagToCollection(collection: Collection, tag: Tag): Promise<TagObject> {
    const tagObject = {};
    tagObject[tag.key] = tag.value;

    return this.apiClient.http
      .patch(`/collections/${collection.id}/tags`, tagObject)
      .then((data) => data.content);
  }

  removeTagFromCollection(collection: Collection, tagName: string): Promise<TagObject> {
    return this.apiClient.http
      .delete(`/collections/${collection.id}/tags/${tagName}`)
      .then((data) => data.content);
  }

  deleteCollection(collection: Collection): Promise<any> {
    return this.apiClient.http.delete(`/collections/${collection.id}`);
  }

  fetchCollectionOutputs(collection: Collection): Promise<Output[]> {
    return this.apiClient.http
      .get(`/collections/${collection.id}/outputs`)
      .then((data) => data.content.outputs || [])
      .then((outputs) => outputs.map(Output.newFromDto));
  }

  createCollectionOutput(output: Output): Promise<Output> {
    return this.apiClient.http
      .post(`/collections/${output.collectionId}/outputs`, Output.toDto(output))
      .then((data) => data.content)
      .then((outputDto) => Output.newFromDto(outputDto));
  }

  updateCollectionOutput(output: Output): Promise<Output> {
    return this.apiClient.http
      .patch(`/collections/${output.collectionId}/outputs/${output.id}`, Output.toDto(output))
      .then((data) => data.content)
      .then((outputDto) => Output.newFromDto(outputDto));
  }

  deleteCollectionOutput(output: Output): Promise<any> {
    return this.apiClient.http.delete(`/collections/${output.collectionId}/outputs/${output.id}`);
  }

  getCollectionOutputStatus(output: Output): Promise<OutputStatus> {
    return this.apiClient.http
      .get(`/collections/${output.collectionId}/outputs/${output.id}/status`)
      .then((data) => data.content);
  }

  getCollectionOutputLogs(output: Output): Promise<OutputLogs> {
    return this.apiClient.http
      .get(`/collections/${output.collectionId}/outputs/${output.id}/logs`)
      .then((data) => data.content);
  }

  sendMessageToCollection(message: CollectionMessage, collection: Collection): Promise<any> {
    return this.apiClient.http.post(`/collections/${collection.id}/to`, message);
  }

  updateCollectionFirmwareManagement(collection: Collection): Promise<Collection> {
    return this.apiClient.http
      .patch(`/collections/${collection.id}`, {
        firmware: collection.firmware,
      })
      .then((data) => data.content)
      .then((collectionDto) => Collection.newFromDto(collectionDto));
  }

  fetchCollectionFirmwareImages(collection: Collection): Promise<FirmwareImage[]> {
    return this.apiClient.http
      .get(`/collections/${collection.id}/firmware`)
      .then((data) => data.content.images || [])
      .then((firmwareImages: FirmwareImageDto[]) =>
        firmwareImages.map(FirmwareImage.newFromDto).sort((fa, fb) => {
          return fb.created - fa.created;
        }),
      );
  }

  createCollectionFirmwareImage(
    firmwareImage: FirmwareImage,
    firmwareData: FormData,
  ): Promise<FirmwareImage> {
    return this.apiClient.http
      .post(`/collections/${firmwareImage.collectionId}/firmware`, firmwareData)
      .then((data) => data.content)
      .then(FirmwareImage.newFromDto);
  }

  updateCollectionFirmwareImage(firmwareImage: FirmwareImage): Promise<FirmwareImage> {
    return this.apiClient.http
      .patch(
        `/collections/${firmwareImage.collectionId}/firmware/${firmwareImage.id}`,
        firmwareImage.asUpdate(),
      )
      .then((data) => data.content)
      .then(FirmwareImage.newFromDto);
  }

  deleteCollectionFirmwareImage(firmwareImage: FirmwareImage): Promise<any> {
    return this.apiClient.http.delete(
      `/collections/${firmwareImage.collectionId}/firmware/${firmwareImage.id}`,
    );
  }

  fetchCollectionFirmwareImage(
    collection: Collection,
    firmwareImageId: string,
  ): Promise<FirmwareImage> {
    return this.apiClient.http
      .get(`/collections/${collection.id}/firmware/${firmwareImageId}`)
      .then((data) => data.content)
      .then(FirmwareImage.newFromDto);
  }

  fetchFirmwareUsage(firmwareImage: FirmwareImage): Promise<any> {
    return this.apiClient.http
      .get(`/collections/${firmwareImage.collectionId}/firmware/${firmwareImage.id}/usage`)
      .then((data) => data.content)
      .then(FirmwareImage.newFirmwareImageUsageFromDto);
  }

  fetchDeviceMessagesByCollectionId(
    collectionId: string,
    { limit = 256, since = null, until = null }: DataSearchParameters = {},
    sort: boolean = false,
  ): Promise<DeviceDataMessage[]> {
    return this.apiClient.http
      .get(
        `/collections/${collectionId}/data?` +
          `${limit ? "limit=" + limit : ""}` +
          `${since ? "&since=" + format(since, "T") : ""}` +
          `${until ? "&until=" + format(until, "T") : ""}`,
      )
      .then((data) => {
        return data.content.messages;
      })
      .then((messages: DeviceDataMessage[] = []) => {
        if (sort) {
          return messages.sort((a, b) => {
            return a.received - b.received;
          });
        } else {
          return messages;
        }
      });
  }
}
