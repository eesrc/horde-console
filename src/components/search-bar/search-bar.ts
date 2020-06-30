import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { autoinject, bindable } from "aurelia-framework";
import { NavigationInstruction, Router } from "aurelia-router";
import { Collection, CollectionService } from "Services/CollectionService";
import { Device, DeviceService } from "Services/DeviceService";
import { Team, TeamService } from "Services/TeamService";

import "./search-bar.scss";

const EXCLUDED_TAG_VALUES: string[] = ["data-mapper-chain"];

interface RouterSuccessEvent {
  instruction: NavigationInstruction;
}

interface ICurrentInstructionParams {
  deviceId?: string;
  collectionId?: string;
}

interface CommonEntity extends TagEntity {
  id: string;
}

import { LogBuilder } from "Helpers/LogBuilder";
const Log = LogBuilder.create("Search bar");

@autoinject
export class SearchBar {
  @bindable searchTerm: string = "";
  @bindable hasFocus: boolean = false;

  collectionResults: Collection[] = [];
  teamResults: Team[] = [];
  deviceResults: Device[] = [];

  normalizedSearchParam: string = "";
  currentNavigationParams: ICurrentInstructionParams = {};

  subscriptions: Subscription[] = [];
  loading: boolean = false;
  error: boolean = false;

  constructor(
    private deviceService: DeviceService,
    private teamService: TeamService,
    private collectionService: CollectionService,
    private router: Router,
    private eventAggregator: EventAggregator,
  ) {}

  bind() {
    this.subscriptions.push(
      this.eventAggregator.subscribe(
        "router:navigation:success",
        (instruction: RouterSuccessEvent) => {
          const allInstructions = instruction.instruction.getAllInstructions();
          this.currentNavigationParams = allInstructions[allInstructions.length - 1].params;

          this.searchTermChanged(this.searchTerm);
        },
      ),
    );
  }

  async searchTermChanged(searchTerm: string) {
    this.normalizedSearchParam = searchTerm.toLowerCase().trim();
    return this.search();
  }

  async search() {
    this.loading = true;
    this.error = false;

    if (this.normalizedSearchParam === "") {
      return;
    }

    return Promise.all([
      this.fetchAndSearchTeams(),
      this.fetchAndSearchDevices(),
      this.fetchAndSearchCollections(),
    ])
      .then(() => {
        this.loading = false;
      })
      .catch((error) => {
        this.loading = false;
        this.error = true;
        Log.error("Error when fetching resources for search", error);
      });
  }

  fetchAndSearchTeams() {
    this.teamResults = [];
    return this.teamService.fetchAllTeams().then((teams) => {
      this.teamResults = teams.filter((team) => this.searchPredicate(team));
    });
  }

  fetchAndSearchCollections() {
    this.collectionResults = [];
    return this.collectionService.fetchAllCollections().then((collections) => {
      this.collectionResults = collections.filter((collection) => this.searchPredicate(collection));
    });
  }

  fetchAndSearchDevices() {
    this.deviceResults = [];
    if (this.currentNavigationParams.collectionId) {
      return this.deviceService
        .fetchCollectionDevices(this.currentNavigationParams.collectionId)
        .then((devices) => {
          this.deviceResults = devices.filter((device) => this.searchPredicate(device));
        });
    }
  }

  clearSearch() {
    this.searchTerm = "";
  }

  navigateToCollection(collection: Collection) {
    this.router.navigate(`/collection-overview/${collection.id}`);
    this.searchTerm = "";
  }

  searchPredicate(entity: CommonEntity) {
    const searchTerm = this.normalizedSearchParam;

    if (this.isDevice(entity)) {
      if (entity.imei.includes(searchTerm) || entity.imsi.includes(searchTerm)) {
        return true;
      }
    }

    return entity.id.includes(searchTerm) || this.tagEntityHasSearchTerm(entity);
  }

  private tagEntityHasSearchTerm(tagEntity: TagEntity): boolean {
    const searchTerm = this.normalizedSearchParam;

    return Object.keys(tagEntity.tags).some((key) => {
      return (
        key.toLowerCase().includes(searchTerm) ||
        (!EXCLUDED_TAG_VALUES.includes(key) &&
          tagEntity.tags[key].toLowerCase().includes(searchTerm))
      );
    });
  }

  private isDevice(tagEntity: TagEntity): tagEntity is Device {
    return (tagEntity as Device).imei !== undefined;
  }
}
