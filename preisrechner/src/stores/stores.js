import { writable, get } from "svelte/store";
import pp from "papaparse";
const ppConfig = { header: true };
import axios from "axios";

let strapiURL;
if (isProduction) {
    strapiURL = "https://cms.lectonet.de/api";
} else {
    strapiURL = "http://localhost:1337/api";
}

export const groups = writable([]);
export const services = writable([]);
export const types = writable([]);

export const quantity = writable(1);
export const price = writable(0);
export const calculatedPrice = writable("0.00");

export const priceDisableStatus = writable(true);

export const selectedCategories = writable({
    group: null,
    service: null,
    type: null,
});

export const bewerbungCheckboxes = writable();
export const bewerbungenSelectedTypes = writable();

export const prices = writable();

// initial fetch of all paths to CSV's
const fetchedCSVData = axios.get(`${strapiURL}/preis?populate=*`);

fetchedCSVData
    .then((fetchedData) => {
        const servicesTEMP = [];
        // initial API-Response, 'extractedData' contains
        // an array of objects {leistung, CSV}
        // CSV.url contains path to CSV-Data for 'leistung'
        const extractedData = fetchedData.data.data.attributes;
        console.log("extracted data", extractedData);
        // get all "Leistungen"(Services) and add them to
        // TEMP array (later used to set() corresponding writable())
        extractedData.forEach((entry) => {
            servicesTEMP.push(entry.leistung);
        });
        services.set(servicesTEMP);
        // pass on extractedData
        return extractedData;
    })
    .then((extractedData) => {
        const CSVData_Promises = [];
        // fetch CSV-Data of all "services"
        extractedData.forEach((entry) => {
            // fetch CSV-Data from URL's and push each returned promise
            // (from axios) into an array of promises;
            // prepend strapiURL to each URL
            const CSVDataPromise = axios.get(`${strapiURL}${entry.CSV.url}`);
            CSVData_Promises.push(CSVDataPromise);
        });
        // build a new object with the name of the "service" and
        // its corresponding "CSVString" data;
        // order of promises and services is maintained so we can just use
        // the index of the iteration to find the service's name
        let bigPromise = Promise.all(CSVData_Promises).then((CSVData_Array) => {
            const AllCSVDataObjects = [];
            CSVData_Array.forEach((CSVString, index) => {
                AllCSVDataObjects.push({
                    serviceName: get(services)[index],
                    CSVString: CSVString.data,
                });
            });
            // finished array of objects { serviceName, CSVString }
            // returned to bigPromise
            return AllCSVDataObjects;
        });
        // Promise that all objects of nature { serviceName, CSVString }
        // are successfully constructed
        return bigPromise;
    })
    .then((bigPromise) => {
        const pricesTEMP = [];
        bigPromise.forEach((CSVObject) => {
            let service = CSVObject.serviceName;
            let parsedCSVString = pp.parse(CSVObject.CSVString, ppConfig).data;
            parsedCSVString.forEach((line) => {
                let type;
                for (const [key, value] of Object.entries(line)) {
                    if (`${key}` === "") {
                        type = `${value}`;
                    } else {
                        const objectToPush = {
                            group: `${key}`,
                            service: service,
                            type: type,
                            price: `${value}`,
                        };
                        pricesTEMP.push(objectToPush);
                    }
                }
            });
            // filter out all elements that have no price
            // and therefor are irrelevant
            const filteredPrices = pricesTEMP.filter(
                (entry) => entry.price !== ""
            );
            prices.set(filteredPrices);
        });
        return pricesTEMP;
    })
    .then((pricesTEMP) => {
        // object { group, service, type }
        selectedCategories.subscribe((object) => {
            quantity.set(1);
            calculatedPrice.set("0.00");
            // construct a new set of distinct 'groups', sort them and
            // assign resulting array to writable() "group"
            const groupsTEMP = Array.from(
                new Set(pricesTEMP.map((item) => item.group))
            );
            groupsTEMP.sort();
            groups.set(groupsTEMP);

            // do the same for all 'types'
            const typesTEMP = Array.from(
                new Set(pricesTEMP.map((item) => item.type))
            );
            typesTEMP.sort();
            types.set(typesTEMP);

            // get the complete Array containing all price-objects
            // { group, service, type, price }
            let filteredPrices = get(prices);

            // only do something if a 'group' was chosen
            if (object.group !== null) {
                filteredPrices = filteredPrices.filter((entry) => {
                    return entry.group === object.group;
                });

                // repopulate the 'service' dropdown
                const servicesTEMP = Array.from(
                    new Set(filteredPrices.map((item) => item.service))
                );
                servicesTEMP.sort();
                services.set(servicesTEMP);
            }

            // if 'group' and 'service' are both selected
            // filter by 'service' and repopulate 'types'
            if (object.group !== null && object.service !== null) {
                filteredPrices = filteredPrices.filter((entry) => {
                    return entry.service === object.service;
                });

                // repopulate the "type" dropdown
                const typesTEMP = Array.from(
                    new Set(filteredPrices.map((item) => item.type))
                );
                typesTEMP.sort();
                types.set(typesTEMP);
            }

            // if a full, distinct selection was made,
            // get the price
            if (
                object.group !== null &&
                object.service !== null &&
                object.type !== null
            ) {
                filteredPrices = filteredPrices.filter((entry) => {
                    return entry.group === object.group;
                });
                filteredPrices = filteredPrices.filter((entry) => {
                    return entry.service === object.service;
                });

                // for 'Bewerbungen' set 'price' to whole object
                // including all prices for all 'types'
                if (object.service !== "Bewerbung") {
                    filteredPrices = filteredPrices.filter((entry) => {
                        return entry.type === object.type;
                    });
                    // set price to 0 before assigning the real value to make
                    // sure the subscription gets triggered
                    price.set(0);
                    price.set(filteredPrices[0].price);
                } else {
                    price.set(0);
                    price.set(filteredPrices);
                }
                priceDisableStatus.set(false);
            }
        }); // end of subscribe()
    }); // end of then()
