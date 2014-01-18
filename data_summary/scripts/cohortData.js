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
        this.criteria.push(criteria);
    };

    // TODO currently removes only first match... better to remove ALL matches
    this.removeCriteria = function(feature, value) {
        for (var i = 0; i < this.criteria.length; i++) {
            if ((this.criteria[i]["feature"] == feature) && (this.criteria[i]["value"] == value)) {
                console.log('found element to remove');
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
     * Get the subsequent drug.
     * ["attributes"]["SU2C Subsequent TX V2"]["Drug Name"]
     * ["attributes"]["SU2C Subsequent TX V2"]["Treatment Details"]
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
            // TODO get drug name
            var drugName = this.data["attributes"]["SU2C Subsequent TX V2"]["Drug Name"];
            if ( drugName instanceof Array) {
                for (var i in drugName) {
                    var drug = drugName[i];
                    if (drug != "") {
                        data.push("d" + drug);
                    }
                }
            } else {
                if ((drugName != null) && (drugName != "")) {
                    data.push("d" + drugName);
                }
            }
            // TODO get tx details
            var txDetails = this.data["attributes"]["SU2C Subsequent TX V2"]["Treatment Details"];
            if ( txDetails instanceof Array) {
                for (var i in txDetails) {
                    var tx = txDetails[i];
                    if (tx != "") {
                        data.push("t" + tx);
                    }
                }
            } else {
                if ((txDetails != null) && (txDetails != "")) {
                    data.push("t" + txDetails);
                }
            }
            // TODO process drugs/Tx details
            return JSON.stringify(data);
        }
    };

    /**
     * Process the drug list.  Remove trailing 'acetate'.  Skip 'prednisone'.
     */
    processDrugList = function(drugString) {
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

    /**
     * Get the subsequent drug.
     * ["attributes"]["SU2C Subsequent TX V2"]["Drug Name"]
     * ["attributes"]["SU2C Subsequent TX V2"]["Treatment Details"]
     */
    this.getSubsequentDrugs_old = function() {
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
            var val = this.data["attributes"]["SU2C Subsequent TX V2"]["Drug Name"];
            if ( val instanceof Array) {
                // TODO multiple drug treatments separated by "and"
                val = JSON.stringify(val);
            } else {
                val = val.trim();
            }
            if (val == null || val == "") {
                var txDetails = this.data["attributes"]["SU2C Subsequent TX V2"]["Treatment Details"].trim();
                if (txDetails != "") {
                    this.data["attributes"]["SU2C Subsequent TX V2"]["Drug Name"] = txDetails;
                    val = txDetails;
                } else {
                    this.data["attributes"]["SU2C Subsequent TX V2"]["Drug Name"] = unknown;
                    val = unknown;
                }
            }
            val = processDrugList(val);
            this.data["attributes"]["SU2C Subsequent TX V2"]["Drug Name"] = val;
            return val;
        }
    };

    /**
     * Process the drug list.  Remove trailing 'acetate'.  Skip 'prednisone'.
     */
    processDrugList_old = function(drugString) {
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
     * Get the counts for the specified patient IDs and feature. feature is one of ['studySite', 'biopsySite'].
     */
    this.getPatientCounts = function(ids, feature) {
        var featureL = feature.toLowerCase();
        var counts = new Object();
        for (var i in ids) {
            var id = ids[i];
            console.log("id->" + id + " " + feature);
            var val = '__NOT_SET__';
            if (featureL == 'studysite') {
                val = this.getPatient(id).getStudySite();
            } else if (featureL == 'biopsysite') {
                val = this.getPatient(id).getBiopsySite();
            } else if (featureL == 'subsequentdrugs') {
                val = this.getPatient(id).getSubsequentDrugs();
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
     *Select the IDs based on multiple criteria.  selectionCriteria is an Array of objects{feature,value}.
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
     * From the specified ID list, select only the patients by the specified parameters.  feature is one of ['studySite', 'biopsySite'].
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