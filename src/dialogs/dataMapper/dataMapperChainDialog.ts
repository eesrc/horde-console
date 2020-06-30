import {
  AVAILABLE_MAPPERS_TYPES,
  DataMapperChain,
  IDataValue,
  IMapper,
  Mappers,
} from "@exploratoryengineering/data-mapper-chain";
import { DialogController, DialogService } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable, BindingEngine, Disposable, PLATFORM } from "aurelia-framework";
import { LogBuilder } from "Helpers/LogBuilder";
import { DeviceDataMessage } from "Models/Device";

const Log = LogBuilder.create("Create data mapper dialog");

@autoinject
export class DataMapperChainDialog {
  heading: string = "";
  confirmButtonText: string = "";
  cancelButtonText: string = "Cancel";

  dataMapper: DataMapperChain;
  availableMappers = AVAILABLE_MAPPERS_TYPES;

  @bindable testString: string = "";
  testResult: IDataValue = "";

  subscriptions: Disposable[] = [];
  intervalId: number;

  dataMapperName: string = "";
  mappers: IMapper[] = [Mappers.base64()];
  visualizationType: string = "graph";

  constructor(
    private dialogController: DialogController,
    private bindingEngine: BindingEngine,
    private dialogService: DialogService,
    private eventAggregator: EventAggregator,
  ) {
    this.dataMapper = new DataMapperChain();
  }

  addNewMapper(index: number) {
    this.dialogService
      .open({
        viewModel: PLATFORM.moduleName("dialogs/dataMapper/dataMapperChooser"),
        model: {},
      })
      .whenClosed((output) => {
        if (!output.wasCancelled) {
          this.mappers.splice(index, 0, this.createNewMapperById(output.output));
          this.testChain();
        }
      });
  }

  removeDataMapper(index: number) {
    Log.debug("Removing index", index);
    this.mappers.splice(index, 1);
    this.testChain();
  }

  submitDataMapper() {
    Log.debug("Submitting data mapper", this.dataMapper);
    this.dataMapper.name = this.dataMapperName;
    this.dataMapper.meta["visualization-type"] = this.visualizationType;
    this.dialogController.ok(this.dataMapper);
  }

  cancel() {
    this.dialogController.cancel();
  }

  testChain() {
    this.testResult = this.dataMapper.mapData(this.testString);
  }

  testStringChanged() {
    this.testChain();
  }

  bind() {
    this.subscriptions.push(
      this.bindingEngine.collectionObserver(this.mappers).subscribe(() => {
        this.updateDataMapperChain();
      }),
    );
    this.subscriptions.push(
      this.eventAggregator.subscribe("deviceMessage", (deviceDataMessage: DeviceDataMessage) => {
        this.testString = deviceDataMessage.payload;
      }),
    );
    /* TODO: This is a cheap way of checking for changes, and should be improved */
    this.intervalId = window.setInterval(() => {
      this.updateDataMapperChain();
    }, 2000);
  }

  unbind() {
    this.subscriptions.map((subscription) => subscription.dispose());
    this.subscriptions = [];
    window.clearInterval(this.intervalId);
  }

  activate(args) {
    if (args) {
      this.testString = args.testString || "";
    }
  }

  private updateDataMapperChain() {
    Log.debug("Updating chain", this.mappers);
    this.dataMapper = new DataMapperChain();
    this.mappers.forEach((mapper) => {
      Log.debug("Adding mapper", mapper);
      this.dataMapper.addMapper(mapper);
    });
    this.testChain();
  }

  private createNewMapperById(id) {
    const mapperType = this.dataMapper.findMapperTypeById(id);

    if (mapperType) {
      return new mapperType.entity({});
    }
  }
}
