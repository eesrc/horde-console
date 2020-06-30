import { DialogService } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, newInstance } from "aurelia-framework";
import { Router } from "aurelia-router";
import { CollectionStream } from "Helpers/CollectionStream";
import { Collection, CollectionService, NotFoundError } from "Services/CollectionService";
import { Device, DeviceService } from "Services/DeviceService";
import { Team, TeamService } from "Services/TeamService";

@autoinject
export class CollectionRoute {
  devices: Device[] = [];

  collection: Collection;
  collections: Collection[] = [];
  collectionsByTeam: Collection[] = [];

  team: Team;
  teams: Team[] = [];

  constructor(
    protected collectionService: CollectionService,
    protected deviceService: DeviceService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected eventAggregator: EventAggregator,
    protected router: Router,
    @newInstance(CollectionStream) protected collectionStream: CollectionStream,
  ) {}

  fetchCollectionRouteResources(collectionId: string) {
    this.deviceService.fetchCollectionDevices(collectionId).then((devices) => {
      this.devices = devices.sort((deviceA, deviceB) => {
        return (
          new Date(deviceB.tags["radius-allocated-at"] || 0).getTime() -
          new Date(deviceA.tags["radius-allocated-at"] || 0).getTime()
        );
      });
    });

    return Promise.all([this.collectionService.fetchAllCollections()]).then(([collections]) => {
      this.collection = collections.find((collection) => {
        return collection.id === collectionId;
      });

      if (!this.collection) {
        throw new NotFoundError("Collection not found");
      }

      this.collections = collections;
      this.collectionsByTeam = collections.filter((collection) => {
        return collection.teamId === this.collection.teamId;
      });

      return this.teamService.fetchAllTeams().then((teams) => {
        this.teams = teams;
        this.team = teams.find((team) => {
          return team.id === this.collection.teamId;
        });
      });
    });
  }
}
