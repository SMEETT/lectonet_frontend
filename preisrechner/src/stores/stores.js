import { writable, get, readable } from "svelte/store";
import pp from "papaparse";
const ppConfig = { header: true };
import axios from "axios";

let strapiURL;
if (isProduction) {
    strapiURL = "https://cms.lectonet.de";
} else {
    strapiURL = "http://localhost:1337";
}

let strapiAPI;
if (isProduction) {
    strapiAPI = "https://cms.lectonet.de/api";
} else {
    strapiAPI = "http://localhost:1337/api";
}

export const groups = writable([]);
export const services = writable([]);
export const types = writable([]);

export const quantity = writable(1);
export const price = writable("* 0.00");
export const priceReduced = writable();
export const pricetiers = writable([]);
export const appliedReduction = writable(0);

export const calculatedPrice = writable("* 0.00");
export const priceUpperBound = readable(1.2);

export const formSuccessfullySubmitted = writable(false);

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
const fetchedCSVData = axios.get(
    `${strapiAPI}/preis?populate[Preis][populate][0]=CSV`
);

function parsePricetiers(str) {
    console.log(str);
    // remove all whitespace from string
    try {
        const string = str.replace(/\s/g, "");
        const regExp = new RegExp("[0-9]+[:][-][0-9]+[%]");
        const split = string.split(",");
        const result = [];
        split.forEach((el) => {
            if (regExp.test(el)) {
                let newElement = el.split(":");
                const obj = {
                    start: parseInt(newElement[0], 10),
                    reduction: parseInt(
                        (newElement[1] = newElement[1].slice(1, -1)),
                        10
                    ),
                };
                result.push(obj);
            } else {
                console.log("ERROR element doesn't match REGEXP");
                return;
            }
        });
        console.log("result", result);
        return result;
    } catch {
        console.log("ERROR while parsing pricetiers");
    }
}
fetchedCSVData
    // extract SERVICES (Korrektur, Lektorate etc.)
    .then((fetchedData) => {
        const servicesTEMP = [];
        // initial API-Response, 'extractedData' contains
        // an array of objects [leistung, CSV]
        // CSV.url contains path to CSV-Data for 'leistung'
        const extractedData = fetchedData.data.data.attributes.Preis;
        // get all "Leistungen"(Services) and add them to
        // TEMP array (later used to set() corresponding writable())
        console.log("extractedDATA", extractedData);
        // 'entry' is coming directly from CMS and contains {leistung(name), CSV}
        extractedData.forEach((entry) => {
            servicesTEMP.push(entry.leistung);
        });
        services.set(servicesTEMP);
        // pass on extractedData
        return extractedData;
    })
    // fetch and transform CSV Data
    .then((extractedData) => {
        const CSVData_Promises = [];
        // fetch CSV-Data of all "services"
        extractedData.forEach((entry) => {
            // fetch CSV-Data from URL's and push each returned promise
            // (from axios) into an array of promises;
            // prepend strapiURL to each URL
            const CSVDataPromise = axios.get(
                `${strapiURL}${entry.CSV.data.attributes.url}`
            );
            CSVData_Promises.push(CSVDataPromise);
        });
        // build a new object with the name of the "service" and
        // its corresponding "CSVString" data;
        // order of promises and services is maintained so we can just use
        // the index of the iteration to find the service's name
        let bigPromise = Promise.all(CSVData_Promises).then((CSVData_Array) => {
            const AllCSVDataObjects = [];
            console.log("CSVData_Array", CSVData_Array);
            CSVData_Array.forEach((CSVString, index) => {
                AllCSVDataObjects.push({
                    serviceName: get(services)[index],
                    CSVString: CSVString.data,
                });
            });
            // finished array of objects { serviceName, CSVString }
            // returned to bigPromise
            console.log("AllCSVDataObjects", AllCSVDataObjects);
            return AllCSVDataObjects;
        });
        // Promise that all objects of nature { serviceName, CSVString }
        // are successfully constructed
        return bigPromise;
    })
    .then((bigPromise) => {
        console.log("then bigPromise");
        const pricesTEMP = [];
        // go over each CSV Data String
        bigPromise.forEach((CSVObject) => {
            let type = {
                name: null,
                pricetiers: null,
                price: null,
            };
            let parsedCSVString = pp.parse(CSVObject.CSVString, ppConfig).data;
            parsedCSVString.forEach((line) => {
                for (const [key, value] of Object.entries(line)) {
                    // console.log("key / value", `${key}` + "/" + `${value}`);
                    if (`${key}` === "Staffelung") {
                        // console.log("Preisstaffelung", `${value}`);
                        type.pricetiers = value;
                        // console.log("value", value);
                        // console.log("service object", service);
                    } else if (`${key}` === "Art") {
                        type.name = `${value}`;
                    } else {
                        const objectToPush = {
                            group: `${key}`,
                            // service object: {name, pricetiers, price}
                            service: CSVObject.serviceName,
                            type: { ...type, price: `${value}` },
                        };
                        pricesTEMP.push(objectToPush);
                    }
                }
            });
            // filter out all elements that have no price
            // and therefor are irrelevant
            // console.log("filtered Prices before removing empties", pricesTEMP);
            const filteredPrices = pricesTEMP.filter((entry) => {
                // console.log("ENTRY", entry.type.price);
                return entry.type.price !== "";
            });
            console.log(
                // "filtered Prices after removing empties",
                filteredPrices
            );
            prices.set(filteredPrices);
        });
        return pricesTEMP;
    })
    .then((pricesTEMP) => {
        // array of: object { group, service {name, pricetiers}, type, price }
        selectedCategories.subscribe((object) => {
            console.log("init object (after group selection))", object);
            console.log("pricesTEMP!", pricesTEMP);
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
            console.log("types", typesTEMP);

            // get the complete Array containing all price-object
            // { group, service, type, price }
            let filteredPrices = get(prices);
            console.log(
                "filteredPrices before group selection",
                filteredPrices
            );

            // only do something if a 'group' was chosen
            if (object.group !== null) {
                filteredPrices = filteredPrices.filter((entry) => {
                    return entry.group === object.group;
                });
                console.log("filtered Prices", filteredPrices);

                // repopulate the 'service' dropdown
                const servicesTEMP = Array.from(
                    new Set(
                        filteredPrices.map((item) => {
                            return item.service;
                        })
                    )
                );

                servicesTEMP.sort();
                console.log("servicesTEMP", servicesTEMP);
                services.set(servicesTEMP);
            }

            // if 'group' and 'service' are both selected
            // filter by 'service' and repopulate 'types'
            if (object.group !== null && object.service !== null) {
                console.log("object", object);
                filteredPrices = filteredPrices.filter((entry) => {
                    return entry.service === object.service;
                });

                // repopulate the "type" dropdown
                const typesTEMP = Array.from(
                    new Set(filteredPrices.map((item) => item.type.name))
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
                console.log("OBJECT FINAL", object);
                filteredPrices = filteredPrices.filter((entry) => {
                    return entry.group === object.group;
                });
                filteredPrices = filteredPrices.filter((entry) => {
                    return entry.service === object.service;
                });
                console.log(
                    "filteredPrices after DISTINCT selection",
                    filteredPrices
                );

                // for 'Bewerbungen' set 'price' to whole object
                // including all prices for all 'types'
                if (object.service !== "Bewerbung") {
                    filteredPrices = filteredPrices.filter((entry) => {
                        return entry.type.name === object.type;
                    });
                    console.log("final filtered price", filteredPrices);
                    // set price to 0 before assigning the real value to make
                    // sure the subscription gets triggered
                    price.set(0);
                    price.set(filteredPrices[0].type.price);
                    const pricetiersParsed = parsePricetiers(
                        filteredPrices[0].type.pricetiers
                    );
                    pricetiers.set(pricetiersParsed);
                } else {
                    price.set(0);
                    price.set(filteredPrices);
                }
                priceDisableStatus.set(false);
            }
        }); // end of subscribe()
    }); // end of then()
