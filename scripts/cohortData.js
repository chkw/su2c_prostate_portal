/**
 * chrisw@soe.ucsc.edu
 * December 19, 2013
 * cohortData is created with a cohortJSON.  Patients may be selected on various criteria.
 * Also, counts can be retrieved for the purpose of drawing graphs/figures.
 */

/**
 * Data about a single patient.
 * @param {Object} data
 */
function patientData(data) {
    this.data = data;

    /**
     * Get the study site.
     */
    this.getStudySite = function() {
        if (this.data == null) {
            return null;
        } else if (this.data["attributes"] == null) {
            return null;
        } else if (this.data["attributes"]["Demographics"] == null) {
            return null;
        } else {
            var val = this.data["attributes"]["Demographics"]["Study Site"];
            return val;
        }
    };

    /**
     * Get the biopsy site.
     */
    this.getBiopsySite = function() {
        if (this.data == null) {
            return null;
        } else if (this.data["attributes"] == null) {
            return null;
        } else if (this.data["attributes"]["SU2C Biopsy V2"] == null) {
            return null;
        } else {
            var val = this.data["attributes"]["SU2C Biopsy V2"]["Site"];
            return val;
        }
    };
}

/**
 * A group of patient data.
 * @param {Object} cohortJson
 */
function cohortData(cohortJson) {

    // parse the cohort data
    this.cohort = JSON && JSON.parse(cohortJson) || $.parseJSON(cohortJson);

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
        var counts = new Object();
        for (var i in ids) {
            var id = ids[i];
            var val = '__NOT_SET__';
            if (feature == 'studySite') {
                val = this.getPatient(id).getStudySite();
            } else if (feature == 'biopsySite') {
                val = this.getPatient(id).getBiopsySite();
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
        var keptIds = new Array();
        for (var i in startingIds) {
            var id = startingIds[i];
            var patientVal = '__NOT_SET__';
            if (feature.toLowerCase() === 'studysite') {
                patientVal = this.getPatient(id).getStudySite();
            } else if (feature.toLowerCase() === 'biopsysite') {
                patientVal = this.getPatient(id).getBiopsySite();
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
            ids.push(id);
        }
        return ids;
    };
}