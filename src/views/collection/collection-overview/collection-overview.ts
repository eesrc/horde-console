import { DialogService } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, computedFrom, PLATFORM } from "aurelia-framework";
import { Router } from "aurelia-router";
import { HelpDialogHelper } from "Helpers/HelpDialogHelper";
import { LogBuilder } from "Helpers/LogBuilder";
import { Collection, CollectionService, ConflictError } from "Services/CollectionService";
import { Team, TeamService } from "Services/TeamService";

const Log = LogBuilder.create("Collections overview");

@autoinject
export class CollectionOverview {
  collections: Collection[] = [];
  teams: Team[] = [];

  constructor(
    private collectionService: CollectionService,
    private teamService: TeamService,
    private dialogService: DialogService,
    private eventAggregator: EventAggregator,
    private helpDialogHelper: HelpDialogHelper,
    private router: Router,
  ) {}

  activate() {
    this.helpDialogHelper.showHelpDialog("collectionsOverview");
    return this.fetchTeamsAndCollections();
  }

  @computedFrom("teams", "collections")
  get teamCollections() {
    return this.teams;
  }

  filterCollectionsByTeamId(teamId: string): Collection[] {
    return this.collections.filter((collection) => {
      return collection.teamId === teamId;
    });
  }

  createNewCollection(teamId: string) {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/collection/createCollectionDialog"),
        model: {
          teams: this.teams,
          teamId: teamId,
        },
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.eventAggregator.publish("global:message", {
            body: "Collection created",
          });
          this.fetchTeamsAndCollections();
          this.router.navigateToRoute("collection-details", { collectionId: response.output.id });
        }
      });
  }

  editCollection(collection: Collection) {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/collection/editCollectionDialog"),
        model: {
          teams: this.teams,
          collection: { ...collection },
        },
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.eventAggregator.publish("global:message", {
            body: "Collection updated",
          });
          this.fetchTeamsAndCollections();
        }
      });
  }

  deleteCollection(collectionToDelete: Collection) {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/message/messageDialog"),
        model: {
          messageHeader: `Delete collection?`,
          message: `Note: Before you delete the collection you must first delete all devices and outputs connected to the collection.`,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        },
      })
      .whenClosed((response) => {
        Log.debug("Response from returned dialog", response);
        if (!response.wasCancelled) {
          this.collectionService
            .deleteCollection(collectionToDelete)
            .then(() => {
              this.eventAggregator.publish("global:message", {
                body: "Collection deleted",
              });
              this.fetchTeamsAndCollections();
            })
            .catch((error) => {
              if (error instanceof ConflictError) {
                this.eventAggregator.publish("global:message", {
                  body: "Couldn't delete collection due to existing devices or outputs",
                });
              } else {
                Log.error("Error when trying to delete collection", error);
              }
            });
        }
      });
  }

  private fetchTeamsAndCollections(): Promise<any> {
    return Promise.all([
      this.teamService.fetchAllTeams(),
      this.collectionService.fetchAllCollections(),
    ]).then(([teams, collections]) => {
      this.teams = teams;
      this.collections = collections;
    });
  }
}
