import { routes } from "./collectionRoutes";

export class CollectionSubRouteRouter {
  configureRouter(config) {
    config.map(routes);
  }
}
