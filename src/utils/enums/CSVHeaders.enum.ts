export enum ColumnEnum {
    LEVEL_CELL_NAME = "level",
    METHOD_CELL_NAME = "method",
    SERVICE_CELL_NAME = "service",
    TIMESTAMP_COLUMN_NAME = "@timestamp",
    MESSAGE_CELL_NAME = "message",
}

export enum LevelDataEnum {
    LEVEL_INTERNAL_TRACE = "internaltrace"
}

export enum MessageEnum {
    MESSAGE_REALM = "messageRealm",
    SERVICE_ACTION = "serviceAction",
    SERVICE_DATA = "serviceData",
    MESSAGE_PARAMS = "messageParams"
}

export enum MessageParamsEnum {
    TYPE = "type",
    ORIGINATING_MS = "originatingMS",
    TERMINATING_MS = "terminatingMS",
}

export enum ServiceDataEnum {
    STATUS_CODE = "statusCode",
    HTTP_PARAMS = "httpParams",
}