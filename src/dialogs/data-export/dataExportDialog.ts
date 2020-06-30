import { DialogController } from "aurelia-dialog";
import { autoinject } from "aurelia-framework";
import { AuthService } from "Services/AuthService";

@autoinject
export class DataExportDialog {
  constructor(private dialogController: DialogController, private authService: AuthService) {}

  closeDialog() {
    this.dialogController.cancel();
  }

  initiateDataExport() {
    this.authService.fetchAllUserData();
    this.dialogController.ok();
  }
}
