/**
 * chrisw@soe.ucsc.edu
 * December 19, 2013
 * cohortData is created with a cohortJSON.  Patients may be selected on various criteria.
 * Also, counts can be retrieved for the purpose of drawing graphs/figures.
 */

/**
 * Object for use with cohortData.selectIds(selectionCriteria.getCriteria()) .
 */
function selectionCriteria() {
    this.criteria = new Array();

    this.getCriteria = function() {
        return this.criteria;
    };

    this.addCriteria = function(feature, value) {
        var criteria = {
            "feature" : feature,
            "value" : value
        };
        for (var i in this.criteria) {
            if (JSON.stringify(this.criteria[i]) == JSON.stringify(criteria)) {
                return;
            }
        }
        this.criteria.push(criteria);
    };

    this.removeCriteria = function(feature, value) {
        for (var i = 0; i < this.criteria.length; i++) {
            if ((this.criteria[i]["feature"] == feature) && (this.criteria[i]["value"] == value)) {
                this.criteria.splice(i, 1);
                break;
            }
        }
    };

    this.clearCriteria = function() {
        this.criteria.splice(0, this.criteria.length);
    };
}

/**
 * Data about a single patient.
 * @param {Object} data
 */
function patientData(data) {
    this.data = data;

    var noForm = "not assessed";
    var unknown = "unknown";

    /**
     * Get the study site.
     * ["attributes"]["Demographics"]["Study Site"]
     */
    this.getStudySite = function() {
        if (this.data == null) {
            this.data = {
                "attributes" : {
                    "demographics" : {
                        "Study Site" : unknown
                    }
                }
            };
            return noForm;
        } else if (this.data["attributes"] == null) {
            this.data["attributes"] = {
                "demographics" : {
                    "Study Site" : noForm
                }
            };
            return noForm;
        } else if (this.data["attributes"]["Demographics"] == null) {
            this.data["attributes"]["Demographics"] = {
                "Study Site" : noForm
            };
            return noForm;
        } else {
            var val = this.data["attributes"]["Demographics"]["Study Site"].trim();
            if (val == null) {
                this.data["attributes"]["Demographics"]["Study Site"] = unknown;
                val == unknown;
            }
            return val;
        }
    };

    /**
     * Get the biopsy site.
     * ["attributes"]["SU2C Biopsy V2"]["Site"]
     */
    this.getBiopsySite = function() {
        if (this.data == null) {
            this.data = {
                "attributes" : {
                    "SU2C Biopsy V2" : {
                        "Site" : noForm
                    }
                }
            };
            return noForm;
        } else if (this.data["attributes"] == null) {
            this.data["attributes"] = {
                "SU2C Biopsy V2" : {
                    "Site" : noForm
                }
            };
            return noForm;
        } else if (this.data["attributes"]["SU2C Biopsy V2"] == null) {
            this.data["attributes"]["SU2C Biopsy V2"] = {
                "Site" : noForm
            };
            return noForm;
        } else {
            var val = this.data["attributes"]["SU2C Biopsy V2"]["Site"].trim();
            if (val == null) {
                this.data["attributes"]["SU2C Biopsy V2"]["Site"] = unknown;
                val = unknown;
            }
            return val;
        }
    };

    /**
     * Get the treatment details.
     * ["attributes"]["SU2C Subsequent TX V2"]["Treatment Details"]
     */
    this.getTreatmentDetails = function() {
        if (this.data == null) {
            this.data = {
                "attributes" : {
                    "SU2C Subsequent TX V2" : {
                        "Treatment Details" : noForm
                    }
                }
            };
            return noForm;
        } else if (this.data["attributes"] == null) {
            this.data["attributes"] = {
                "SU2C Subsequent TX V2" : {
                    "Treatment Details" : noForm
                }
            };
            return noForm;
        } else if (this.data["attributes"]["SU2C Subsequent TX V2"] == null) {
            this.data["attributes"]["SU2C Subsequent TX V2"] = {
                "Treatment Details" : noForm
            };
            return noForm;
        } else {
            var data = new Array();
            var entry = this.data["attributes"]["SU2C Subsequent TX V2"]["Treatment Details"];
            if (entry == null) {
                // form, but no entry
                this.data["attributes"]["SU2C Subsequent TX V2"]["Treatment Details"] = unknown;
                return unknown;
            } else if ( entry instanceof Array) {
                // array
                for (var i in entry) {
                    var item = entry[i].trim();
                    if (item != "") {
                        data.push(item);
                    }
                }
            } else {
                // not null, not array, probably simple string
                var item = entry.trim();
                if (item != "") {
                    data.push(item);
                } else {
                    this.data["attributes"]["SU2C Subsequent TX V2"]["Treatment Details"] = unknown;
                    return unknown;
                }
            }
            // process data
            return processListOfNames(data, "Treatment Details");
        }
    };

    /**
     * Get the subsequent drug.
     * ["attributes"]["SU2C Subsequent TX V2"]["Drug Name"]
     */
    this.getSubsequentDrugs = function() {
        if (this.data == null) {
            this.data = {
                "attributes" : {
                    "SU2C Subsequent TX V2" : {
                        "Drug Name" : noForm
                    }
                }
            };
            return noForm;
        } else if (this.data["attributes"] == null) {
            this.data["attributes"] = {
                "SU2C Subsequent TX V2" : {
                    "Drug Name" : noForm
                }
            };
            return noForm;
        } else if (this.data["attributes"]["SU2C Subsequent TX V2"] == null) {
            this.data["attributes"]["SU2C Subsequent TX V2"] = {
                "Drug Name" : noForm
            };
            return noForm;
        } else {
            var data = new Array();
            var entry = this.data["attributes"]["SU2C Subsequent TX V2"]["Drug Name"];
            if (entry == null) {
                // form, but no entry
                this.data["attributes"]["SU2C Subsequent TX V2"]["Drug Name"] = unknown;
                return unknown;
            } else if ( entry instanceof Array) {
                // array
                for (var i in entry) {
                    var item = entry[i].trim();
                    if (item != "") {
                        data.push(item);
                    }
                }
            } else {
                // not null, not array, probably simple string
                var item = entry.trim();
                if (item != "") {
                    data.push(item);
                } else {
                    this.data["attributes"]["SU2C Subsequent TX V2"]["Drug Name"] = unknown;
                    return unknown;
                }
            }
            // process data
            return processListOfNames(data, "Drug Name");
        }
    };

    processListOfNames = function(namesArray, type) {
        var result = "";
        var typeL = type.toLowerCase();
        for (var i in namesArray) {
            var name = namesArray[i];
            var processedName = "";
            if (typeL == "drug name") {
                processedName = processDrugName(name);
            } else if (typeL == "treatment details") {
                processedName = processTreatmentDetails(name);
            }
            result = result + " and " + processedName.trim();
        }
        result = result.replace(/^ and /, '');
        return result;
    };

    /**
     * Process treatment details.
     */
    processTreatmentDetails = function(detailsString) {
        var result = "";
        var details = detailsString.split(";");
        for (var i in details) {
            var detail = details[i];
            detail = detail.replace(/ alone, /, ', ');
            result = result + ";" + detail.trim();
        }
        result = result.replace(/^;/, '');
        return result;
    };

    /**
     * Process the drug name.  Remove trailing 'acetate'.  Skip 'prednisone'.
     */
    processDrugName = function(drugString) {
        var result = "";
        var drugs = drugString.split(";");
        for (var i in drugs) {
            var drug = drugs[i].trim();
            drug = drug.replace(/Acetate$/i, '');
            if (drug.toLowerCase() == "prednisone") {
                // do nothing, skip it
            } else {
                result = result + ";" + drug.trim();
            }
        }
        result = result.replace(/^;/, '');
        return result;
    };
}

/**
 * A group of patient data.
 * @param {Object} deserializedCohortJson
 */
function cohortData(deserializedCohortJson) {

    // set the cohort data
    this.cohort = deserializedCohortJson;

    /**
     * Get series data for pie chart from category counts.
     */
    countsToPieData = function(counts) {
        var data = new Array();
        for (var type in counts) {
            var typeData = new Object();
            data.push(typeData);
            typeData["name"] = type;
            typeData["y"] = counts[type];
        }
        return data;
    };

    /**
     * Get the counts for the specified patient IDs and feature
     * feature is one of ['studySite', 'biopsySite', 'subsequentdrugs', 'treatmentdetails'].
     */
    this.getPatientCounts = function(ids, feature) {
        var featureL = feature.toLowerCase();
        var counts = new Object();
        for (var i in ids) {
            var id = ids[i];
            var val = '__NOT_SET__';
            if (featureL == 'studysite') {
                val = this.getPatient(id).getStudySite();
            } else if (featureL == 'biopsysite') {
                val = this.getPatient(id).getBiopsySite();
            } else if (featureL == 'subsequentdrugs') {
                val = this.getPatient(id).getSubsequentDrugs();
            } else if (featureL == 'treatmentdetails') {
                val = this.getPatient(id).getTreatmentDetails();
            }
            if ((val != '__NOT_SET__') && !( val in counts)) {
                counts[val] = 0;
            }
            counts[val]++;
        }
        var data = countsToPieData(counts);
        return data;
    };

    /**
     *Get the patientData.
     */
    this.getPatient = function(patientId) {
        if ( patientId in this.cohort) {
            return new patientData(this.cohort[patientId]);
        } else {
            return null;
        }
    };

    /*
     *Select the IDs based on multiple criteria.
     * selectionCriteria is an Array of objects{feature,value}.
     */
    this.selectIds = function(selectionCriteria) {
        var ids = this.getAllPatientIds();
        if (selectionCriteria.length == 0) {
            return ids;
        }
        for (var i in selectionCriteria) {
            var feature = selectionCriteria[i]["feature"];
            var value = selectionCriteria[i]["value"];

            ids = this.selectPatients(ids, feature, value);
        }
        return ids;
    };

    /**
     * From the specified ID list, select only the patients by the specified parameters.
     * feature is one of ['studySite', 'biopsySite', 'subsequentdrugs', 'treatmentdetails'].
     */
    this.selectPatients = function(startingIds, feature, value) {
        var featureL = feature.toLowerCase();
        var keptIds = new Array();
        for (var i in startingIds) {
            var id = startingIds[i];
            var patientVal = '__NOT_SET__';
            if (featureL === 'studysite') {
                patientVal = this.getPatient(id).getStudySite();
            } else if (featureL === 'biopsysite') {
                patientVal = this.getPatient(id).getBiopsySite();
            } else if (featureL === 'subsequentdrugs') {
                patientVal = this.getPatient(id).getSubsequentDrugs();
            } else if (featureL === 'treatmentdetails') {
                patientVal = this.getPatient(id).getTreatmentDetails();
            }
            if ((patientVal != '__NOT_SET__') && (patientVal == value)) {
                keptIds.push(id);
            }
        }
        return keptIds;
    };

    /**
     * Get array of all patient IDs.
     */
    this.getAllPatientIds = function() {
        var ids = new Array();
        for (var id in this.cohort) {
            if (id == "Biopsy") {
                continue;
            }
            ids.push(id);
        }
        return ids;
    };
}