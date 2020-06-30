import { DialogController } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, PLATFORM, useView } from "aurelia-framework";
import { LogBuilder } from "Helpers/LogBuilder";
import { TagHelper } from "Helpers/TagHelper";
import { Team } from "Models/Team";
import { BadRequestError, Collection, CollectionService } from "Services/CollectionService";

const Log = LogBuilder.create("Create collection dialog");
const th = new TagHelper();

interface ICreateCollectionDialogParams {
  teams: Team[];
  teamId: string;
}

@autoinject
@useView(PLATFORM.moduleName("dialogs/collection/collectionDialog.html"))
export class CreateCollectionDialog {
  headerText: string = "Create new collection";
  confirmButtonText: string = "Create collection";

  collection: Collection = new Collection();

  availableTeams = [];

  constructor(
    private collectionService: CollectionService,
    private dialogController: DialogController,
    private eventAggregator: EventAggregator,
  ) {}

  submitCollection() {
    Log.debug("Collection to be submitted", this.collection);
    this.collectionService
      .createNewCollection(this.collection)
      .then((collection) => {
        this.dialogController.ok(collection);
      })
      .catch((err) => {
        if (err instanceof BadRequestError) {
          this.eventAggregator.publish("global:message", {
            body: `Bad request: ${err.content.message}`,
          });
        } else {
          Log.error("Error when trying to create collection", err);
        }
      });
  }

  activate(args: ICreateCollectionDialogParams) {
    Log.debug("Activate args", args);

    args.teams.forEach((team) => {
      this.availableTeams.push({
        id: team.id,
        value: th.getEntityName(team, "id"),
      });
    });

    this.collection.teamId = args.teamId;
  }
}
