interface IOutputDto {
  outputId: string;
  collectionId: string;
  type: string;
  config: object;
  tags: { [tagName: string]: string };
  enabled: boolean;
}

export interface OutputLogEntry {
  message: string;
  repeated: number;
  timestamp: number;
}

export interface OutputLogs {
  logs: OutputLogEntry[];
}

export interface OutputStatus {
  errorCount: number;
  forwarded: number;
  received: number;
  retries: number;
}

interface MqttConfig {
  endpoint: string;
  clientId: string;
  topicName: string;
  username: string;
  password: string;
  certCheck: boolean;
}

export interface MqttOutput extends Output {
  type: OutputType.mqtt;
  config: MqttConfig;
}

interface IftttConfig {
  eventName: string;
  asIsPayload: boolean;
  key: string;
}

export interface IftttOutput extends Output {
  type: OutputType.ifttt;
  config: IftttConfig;
}

interface UdpConfig {
  host: string;
  port: number;
}

export interface UdpOutput extends Output {
  type: OutputType.udp;
  config: UdpConfig;
}

export interface WebhookConfig {
  url: string;
  basicAuthUser?: string;
  basicAuthPassword?: string;
  customHeaderName?: string;
  customHeaderValue?: string;
}

export interface WebhookOutput extends Output {
  type: OutputType.webhook;
  config: WebhookConfig;
}

export enum OutputType {
  ifttt = "ifttt",
  mqtt = "mqtt",
  webhook = "webhook",
  udp = "udp",
}

export class Output {
  static newFromDto(output: IOutputDto): Output {
    return new Output({
      id: output.outputId,
      collectionId: output.collectionId,
      type: OutputType[output.type],
      config: output.config,
      tags: output.tags,
      enabled: output.enabled,
    });
  }

  static toDto(output: Output): IOutputDto {
    return {
      outputId: output.id,
      collectionId: output.collectionId,
      type: output.type,
      config: output.config,
      tags: output.tags,
      enabled: output.enabled,
    };
  }

  static clone(output: Output): Output {
    return JSON.parse(JSON.stringify(output));
  }

  id: string;
  collectionId: string;
  type: OutputType;
  config: WebhookConfig | MqttConfig | IftttConfig | {};
  tags: { [tagName: string]: string };
  enabled: boolean;

  constructor({
    id = "",
    collectionId = "",
    type = OutputType.webhook,
    config = {},
    tags = {},
    enabled = true,
  } = {}) {
    this.id = id;
    this.collectionId = collectionId;
    this.type = type;
    this.config = config;
    this.tags = tags;
    this.enabled = enabled;
  }
}
