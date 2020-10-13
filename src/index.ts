import axios from 'axios';
import cheerio from 'cheerio';
import aws from 'aws-sdk';

//Create new DocumentClient
let documentClient = new aws.DynamoDB.DocumentClient();

exports.handler = async function (event, context) {

    // Filing date of 10-06-2020
    // const sosId = 2163931

    // Start at last sosid

    const queryParmas: aws.DynamoDB.DocumentClient.QueryInput = {
        TableName: 'secretaryOfState',
        AttributesToGet: [
            'sosId'
        ],
        KeyConditionExpression: ''

    };

    const sosId = documentClient.query(queryParmas).promise();

    let errorCount = 0;
    let sosIdIncrement = 0;

    // while (errorCount < 20) {
    //     let business: any;

    //     try {
    //         business = await getDetails(event.sosId + sosIdIncrement);
    //     }
    //     catch (e) {
    //         console.log('Error when trying to get details for', event.sosId + sosIdIncrement, e);
    //         errorCount++;
    //         continue;
    //     }
    //     business.id = uuidv4();

    //     // No business found at this id
    //     if (business.title === 'No CUR/IP/NON/UNF EN/DBA for this entity') {
    //         console.log('No business found for', event.sosId + sosIdIncrement);
    //         errorCount++;
    //     }
    //     else {
    //         errorCount = 0;
    //         let params = {
    //             TableName: 'secretaryOfState',
    //             Item: business
    //         };
    //         //return documentClient.put(params).promise();
    //         await documentClient.put(params).promise();
    //         console.log('Inserted business', business);
    //     }

    //     await timeout(1000);

    //     sosIdIncrement++;
    // }

    return sosId;
}


async function getDetails(sosId: number) {
    const url = `http://egov.sos.state.or.us/br/pkg_web_name_srch_inq.show_detl?p_be_rsn=${sosId}&p_srce=BR_INQ&p_print=FALSE`;
    const axiosResponse = await axios.get(url);

    const $ = cheerio.load(axiosResponse.data);

    const tables = $('table');


    const now = new Date().toDateString();
    const business: any = {
        title: $('table:nth-of-type(3) tr td:nth-of-type(2)').text(),
        filingDate: $('table:nth-of-type(2) tr td:nth-of-type(5)[bgcolor="#CCDDFF"]').text(),
        state: 'Oregon',
        sosId: sosId,
        url: url,
        createdAt: now,
        updatedAt: now
    };

    for (let i = 0; i < tables.length; i++) {
        const table$ = cheerio.load(tables[i]);
        const tableLabel = table$('tr td:nth-of-type(2)').text();

        switch (tableLabel) {
            case 'PPB':
                const ppbStreet$ = cheerio.load(tables[i + 1]);
                business.physicalStreetAddress = ppbStreet$('tr:nth-of-type(1) td:nth-of-type(2)').text();

                const ppbCityStateCip$ = cheerio.load(tables[i + 2]);
                business.physicalCity = ppbCityStateCip$('tr:nth-of-type(1) td:nth-of-type(2)').text();
                business.physicalState = ppbCityStateCip$('tr:nth-of-type(1) td:nth-of-type(3)').text();
                business.physicalZipcode = ppbCityStateCip$('tr:nth-of-type(1) td:nth-of-type(4)').text();
                break;
            case 'AGT':
                const agentName$ = cheerio.load(tables[i + 1]);
                business.agentFirstName = agentName$('tr:nth-of-type(1) td:nth-of-type(2)').text();
                business.agentLastName = agentName$('tr:nth-of-type(1) td:nth-of-type(4)').text();

                const agentStreet$ = cheerio.load(tables[i + 2]);
                business.agentStreetAddress = agentStreet$('tr:nth-of-type(1) td:nth-of-type(2)').text();

                const agentCityStateCip$ = cheerio.load(tables[i + 3]);
                business.agentCity = agentCityStateCip$('tr:nth-of-type(1) td:nth-of-type(2)').text();
                business.agentState = agentCityStateCip$('tr:nth-of-type(1) td:nth-of-type(3)').text();
                business.agentZipcode = agentCityStateCip$('tr:nth-of-type(1) td:nth-of-type(4)').text();
                break;
            // What happens if there is more than one member?
            case 'MEM':
                const memberName$ = cheerio.load(tables[i + 1]);
                business.memberFirstName = memberName$('tr:nth-of-type(1) td:nth-of-type(2)').text();
                business.memberLastName = memberName$('tr:nth-of-type(1) td:nth-of-type(4)').text();

                const memberStreet$ = cheerio.load(tables[i + 2]);
                business.memberStreetAddress = memberStreet$('tr:nth-of-type(1) td:nth-of-type(2)').text();

                const memberCityStateCip$ = cheerio.load(tables[i + 3]);
                business.memberCity = memberCityStateCip$('tr:nth-of-type(1) td:nth-of-type(2)').text();
                business.memberState = memberCityStateCip$('tr:nth-of-type(1) td:nth-of-type(3)').text();
                business.memberZipcode = memberCityStateCip$('tr:nth-of-type(1) td:nth-of-type(4)').text();
                break;
            case 'REP':
                const repName$ = cheerio.load(tables[i + 1]);
                business.repFirstName = repName$('tr:nth-of-type(1) td:nth-of-type(2)').text();
                business.repLastName = repName$('tr:nth-of-type(1) td:nth-of-type(4)').text();

                const repStreet$ = cheerio.load(tables[i + 2]);
                business.repStreetAddress = repStreet$('tr:nth-of-type(1) td:nth-of-type(2)').text();

                const repCityStateCip$ = cheerio.load(tables[i + 3]);
                business.repCity = repCityStateCip$('tr:nth-of-type(1) td:nth-of-type(2)').text();
                business.repState = repCityStateCip$('tr:nth-of-type(1) td:nth-of-type(3)').text();
                business.repZipcode = repCityStateCip$('tr:nth-of-type(1) td:nth-of-type(4)').text();
                break;
            case 'REG':
                const registrantName$ = cheerio.load(tables[i + 1]);
                business.registrantFirstName = registrantName$('tr:nth-of-type(1) td:nth-of-type(2)').text();
                business.registrantLastName = registrantName$('tr:nth-of-type(1) td:nth-of-type(4)').text();

                const registrantStreet$ = cheerio.load(tables[i + 2]);
                business.registrantStreetAddress = registrantStreet$('tr:nth-of-type(1) td:nth-of-type(2)').text();

                const registrantCityStateCip$ = cheerio.load(tables[i + 3]);
                business.registrantCity = registrantCityStateCip$('tr:nth-of-type(1) td:nth-of-type(2)').text();
                business.registrantState = registrantCityStateCip$('tr:nth-of-type(1) td:nth-of-type(3)').text();
                business.registrantZipcode = registrantCityStateCip$('tr:nth-of-type(1) td:nth-of-type(4)').text();
                break;
            default:
                break;
        }
    }

    return business;
}

function timeout(ms: number) {
    return new Promise(res => setTimeout(res, ms));
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}