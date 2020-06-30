import { DialogController } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, PLATFORM, useView } from "aurelia-framework";
import { LogBuilder } from "Helpers/LogBuilder";
import { TagHelper } from "Helpers/TagHelper";
import { Team } from "Models/Team";
import {
  BadRequestError,
  Collection,
  CollectionService,
  ForbiddenError,
} from "Services/CollectionService";

const Log = LogBuilder.create("Edit collection dialog");
const th = new TagHelper();

interface IEditCollectionDialogParams {
  teams: Team[];
  collection: Collection;
}

@autoinject
@useView(PLATFORM.moduleName("dialogs/collection/collectionDialog.html"))
export class CreateCollectionDialog {
  headerText: string = "Edit collection";
  confirmButtonText: string = "Update collection";

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
      .updateCollection(this.collection)
      .then(() => {
        this.dialogController.ok(this.collection);
      })
      .catch((err: BadRequestError | ForbiddenError) => {
        if (err instanceof BadRequestError) {
          this.eventAggregator.publish("global:message", {
            body: `Bad request: ${err.content.message}`,
          });
        } else if (err instanceof ForbiddenError) {
          this.eventAggregator.publish("global:message", {
            body: `Forbidden: You need to be admin to edit this collection`,
          });
        } else {
          Log.error("Error when trying to edit collection", err);
          this.dialogController.cancel();
        }
      });
  }

  activate(args: IEditCollectionDialogParams) {
    Log.debug("Activate args", args);

    this.collection = args.collection;

    args.teams.forEach((team) => {
      this.availableTeams.push({
        id: team.id,
        value: th.getEntityName(team, "id"),
      });
    });
  }
}
