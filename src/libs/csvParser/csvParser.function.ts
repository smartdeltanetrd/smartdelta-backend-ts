import * as fs from "fs";
import { parse } from 'csv-parse';
import { ColumnEnum, LevelDataEnum, MessageEnum, MessageParamsEnum, ServiceDataEnum } from "../../utils/enums/CSVHeaders.enum";
import { CONSTANTS } from "../../utils/Constants.constant"

export function getRawData(csvPath: fs.PathLike): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let data: any[] = [];
        fs.createReadStream(csvPath)
            .pipe(parse({ delimiter: ",", from_line: 1 }))
            .on("data", async function (row) {
                data.push(row)
            }).on('end', () => {
                resolve(data)
            }).on('error', error => {
                reject(error)
            })
    });
}

export async function processData(rawDataChunk: any[]) { // Only get requested columns from csv. Level should be INTERNALTRACE

    const columnNamesRow = await extractParams(rawDataChunk.shift(), ColumnEnum);

    let cleanDataArray: any[] = new Array;

    rawDataChunk.forEach((record) => {
        if (record[columnNamesRow.get(ColumnEnum.LEVEL_CELL_NAME)!].toLowerCase() === LevelDataEnum.LEVEL_INTERNAL_TRACE) {

            cleanDataArray.push(Object.fromEntries(parseLogRow(record, columnNamesRow)))
        }
    });
    return cleanDataArray;


}


function extractParams(parameterArray: any, colEnums: any): Promise<Map<string, number>> {

    return new Promise((resolve, reject) => {

        const enumValues = Object.values(colEnums)

        const parameterMap = new Map<string, number>;

        parameterArray.forEach((element: any, index: number) => {

            if (enumValues.includes(element.toLowerCase())) {
                parameterMap.set(element.toLowerCase(), index)
            }
        });
        if (!parameterMap.size) {
            reject(new Error("Requested CSV Headers Cannot Found in CSV File"))
        }

        resolve(parameterMap)
    })

}
function parseLogRow(record: any, columnNames: Map<string, number>) {

    try {

        const flattenedRowObj = new Map<string, any>;

        let messageString: string = record[columnNames.get(ColumnEnum.MESSAGE_CELL_NAME)!].trim()

        let messageStringSplitted = messageString.split(":");

        messageStringSplitted[0] = CONSTANTS.DOUBLE_COUNTES.concat(messageStringSplitted[0]).concat(CONSTANTS.DOUBLE_COUNTES);

        messageString = CONSTANTS.OPEN_CURLY_BRACKETS.concat(messageStringSplitted.join(":")).trim().concat(CONSTANTS.CLOSE_CURLY_BRACKETS);

        const jsonMessageString = JSON.parse(messageString)

        flattenedRowObj.set(ColumnEnum.MESSAGE_CELL_NAME, jsonMessageString[Object.keys(jsonMessageString)[0]]);

        for (let [key, value] of columnNames.entries()) {
            (value === columnNames.get(ColumnEnum.MESSAGE_CELL_NAME)) ? "" : record[value] ? flattenedRowObj.set(key, record[value].trim()) : ""
        }

        delete flattenedRowObj.get('message')["authorization"];
        delete flattenedRowObj.get('message')["messageParams"].authorization;


        flatJSONObject(flattenedRowObj)
        return flattenedRowObj;

    } catch (error) {
        console.log(error)
        throw new Error("Cannot Parse Row")
    }


}
function flatJSONObject(flattenedRowObj: Map<string, any>) {

    //messageRealm
    (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_REALM])
        ?
        flattenedRowObj.set(MessageEnum.MESSAGE_REALM, flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_REALM]) : "";



    //serviceAction
    (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_ACTION]) ?
        flattenedRowObj.set(MessageEnum.SERVICE_ACTION, flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_ACTION])
        : "";

    //type

    (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TYPE]) ?
        flattenedRowObj.set(MessageParamsEnum.TYPE, flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TYPE])
        : "";

    //originatingMS
    (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.ORIGINATING_MS]) ?
        flattenedRowObj.set(MessageParamsEnum.ORIGINATING_MS, flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.ORIGINATING_MS])
        : "";

    //terminatingMS
    (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TERMINATING_MS]) ?
        flattenedRowObj.set(MessageParamsEnum.TERMINATING_MS, flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TERMINATING_MS])
        : "";

    //statusCode
    (
        flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_DATA][ServiceDataEnum.STATUS_CODE]
        ||
        (
            flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_DATA][ServiceDataEnum.HTTP_PARAMS]
            &&
            flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_DATA][ServiceDataEnum.HTTP_PARAMS][ServiceDataEnum.STATUS_CODE]
        )
    ) ?
        flattenedRowObj.set(ServiceDataEnum.STATUS_CODE,
            flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_DATA][ServiceDataEnum.STATUS_CODE]
            ||
            flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_DATA][ServiceDataEnum.HTTP_PARAMS][ServiceDataEnum.STATUS_CODE])
        : flattenedRowObj.set(ServiceDataEnum.STATUS_CODE, CONSTANTS.STATIC_STATUS_CODE);


    Object.values(ColumnEnum).forEach(item => {
        flattenedRowObj.set(item, flattenedRowObj.get(item))
    })

    flattenedRowObj.delete(ColumnEnum.MESSAGE_CELL_NAME)

}


