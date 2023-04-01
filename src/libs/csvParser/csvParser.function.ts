import * as fs from "fs";
import { parse } from 'csv-parse';
import { ColumnEnum, LevelDataEnum, MessageEnum, MessageParamsEnum, ServiceDataEnum } from "../../utils/enums/CSVHeaders.enum";
import MLModelInputsConts from "../../utils/constants/MLModelInput.constants";
import { CONSTANTS } from "../../utils/Constants.constant"
import { IAnalyze } from "../../utils/interfaces/ILogic/IAnalyze";
import { NodeType } from "../../utils/types/NodeType";

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

    const columnNamesRow = await extractColumnParams(rawDataChunk.shift(), ColumnEnum);

    let cleanRows: any[] = new Array;
    // let cleanDataArray: any[] = new Array;
    let cleanDataArray = <IAnalyze>{};


    rawDataChunk.forEach((record) => {
        if (record[columnNamesRow.get(ColumnEnum.LEVEL_CELL_NAME)!].toLowerCase() === LevelDataEnum.LEVEL_INTERNAL_TRACE) {
            let parsedRow = parseLogRow(record, columnNamesRow)
            cleanRows.push(Object.fromEntries(parsedRow))
        }
    });
    cleanDataArray.data = cleanRows;
    cleanDataArray.diagram = extractServiceDiagram(cleanRows);

    return cleanDataArray;


}

/*  extractColumnParams(parameterArray:any , columnEnums:any)

    Extracts CSV's first row to parse column names from it and converts Map depending on columnEnum
    
    Returns Map<string,number> = (ColumnName : ColumnIndex)
    . 
*/
function extractColumnParams(parameterArray: any, columnEnums: any): Promise<Map<string, number>> {

    return new Promise((resolve, reject) => {

        const columnEnumValues = Object.values(columnEnums)

        const parameterMap = new Map<string, number>;

        parameterArray.forEach((element: any, index: number) => {

            if (columnEnumValues.includes(element.toLowerCase())) {
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
        flattenedRowObj.set(MLModelInputsConts["messageRealm"], flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_REALM]) : "";

    //serviceAction
    (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_ACTION]) ?
        flattenedRowObj.set(MLModelInputsConts["serviceAction"], flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_ACTION])
        : "";

    /* UNDER MESSAGE_PARAMS SECTION. MIGHT ME LOOP EXCEPT STATUS-CODE*/
    //subscriber
    (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.SUBSCRIBER]) ?
        flattenedRowObj.set(MLModelInputsConts["subscriber"], flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.SUBSCRIBER])
        : "";

    //calledMessageQueue
    (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.CALLED_MESSAGE_QUEUE]) ?
        flattenedRowObj.set(MLModelInputsConts["calledMessageQueue"], flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.CALLED_MESSAGE_QUEUE])
        : "";

    //type
    (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TYPE]) ?
        flattenedRowObj.set(MLModelInputsConts["type"], flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TYPE])
        : "";

    //messageID
    (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.MESSAGE_ID]) ?
        flattenedRowObj.set(MLModelInputsConts["messageID"], flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.MESSAGE_ID])
        : "";

    //correlationID
    if (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.CORRELATION_ID]) {
        flattenedRowObj.set(MLModelInputsConts["correlationID"], flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.CORRELATION_ID])
        flattenedRowObj.set(MLModelInputsConts["correlationIDLen"], flattenedRowObj.get(MLModelInputsConts["correlationID"]))
    }

    //transactionID
    if (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TRANSACTION_ID]) {
        flattenedRowObj.set(MLModelInputsConts["transactionID"], flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TRANSACTION_ID])
        flattenedRowObj.set(MLModelInputsConts["transactionIDLen"], flattenedRowObj.get(MLModelInputsConts["transactionID"]))
    }
    //originatingMS
    (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.ORIGINATING_MS]) ?
        flattenedRowObj.set(MLModelInputsConts["originatingMS"], flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.ORIGINATING_MS])
        : "";

    //terminatingMS
    (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TERMINATING_MS]) ?
        flattenedRowObj.set(MLModelInputsConts["terminatingMS"], flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TERMINATING_MS])
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
        flattenedRowObj.set(MLModelInputsConts["statusCode"],
            flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_DATA][ServiceDataEnum.STATUS_CODE]
            ||
            flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_DATA][ServiceDataEnum.HTTP_PARAMS][ServiceDataEnum.STATUS_CODE])
        : flattenedRowObj.set(MLModelInputsConts["statusCode"], CONSTANTS.STATIC_STATUS_CODE);

    /* UNDER MESSAGE_PARAMS SECTION. MIGHT BE LOOP EXCEPT STATUS-CODE*/

    (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TRANSACTION_ID]) ?
        flattenedRowObj.set(MLModelInputsConts["messageIDLen"], flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.MESSAGE_ID].length) : flattenedRowObj.set(flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TRANSACTION_ID], 0);

    Object.values(ColumnEnum).forEach(item => {
        flattenedRowObj.set(item, flattenedRowObj.get(item))
    })

    flattenedRowObj.delete(ColumnEnum.MESSAGE_CELL_NAME)

}
function extractServiceDiagram(rowArray: Array<any>): any {

    let edgeArray = new Array;
    let nodeArray = new Array;

    rowArray.forEach((row) => {
        let result = edgeArray.findIndex((node) => {
            return node["source"] === row[MLModelInputsConts["originatingMS"]] && node["target"] === row[MLModelInputsConts["terminatingMS"]]
        })

        if (result > -1) {// Means mapping already found. Should be updated
            edgeArray[result]["count"] += 1;
        }
        else {
            let newMapping = {
                source: row[MLModelInputsConts["originatingMS"]],
                target: row[MLModelInputsConts["terminatingMS"]],
                count: 1
            }

            edgeArray.push(newMapping)
        }

        if (!nodeArray.find(item => item.id === row[MLModelInputsConts["originatingMS"]])) {
            nodeArray.push(newNodeCreatorHelper(row[MLModelInputsConts["originatingMS"]]))
        }
        else if (!nodeArray.find(item => item.id === row[MLModelInputsConts["terminatingMS"]])) {
            nodeArray.push(newNodeCreatorHelper(row[MLModelInputsConts["terminatingMS"]]))
        }
    })



    return { edges: edgeArray, nodes: nodeArray };
}

// Helpers

function newNodeCreatorHelper(node: any) {
    let nodeObj = <NodeType>{}
    nodeObj.id = node

    nodeObj.data = {
        label: node
    }

    return nodeObj
}