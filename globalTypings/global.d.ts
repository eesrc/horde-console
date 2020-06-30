/* Configuration variables */

// Boolean which signalizes production build
declare const PRODUCTION: boolean;

// Horde backend endpoint
declare const HORDE_ENDPOINT: string;
// Horde websocket backend endpoint
declare const HORDE_WS_ENDPOINT: string;
// Google Analytics Token
declare const GOOGLE_ANALYTICS_TOKEN: string;
// Google maps API Key
declare const GOOGLE_MAPS_KEY: string;

/**
 * Input search parameters when getting data for either applications
 * or devices
 */
interface DataSearchParameters {
  limit?: number;
  since?: Date;
  until?: Date;
}

/**
 * Tag implementation for application
 */
interface Tag {
  key: string;
  value: string;
}

/**
 * Tagobject exisisting on TagEntities
 */
interface TagObject {
  [tagName: string]: string;
}

/**
 * An entity which contains a tag field with TagObject
 */
interface TagEntity {
  tags: TagObject;
}
