/**
 * @author Pedro Sanders
 * @since v1
 */
import CoreUtils from 'core/utils'
import DSUtil from 'data_api/utils'
import { Status } from 'core/status'
import { UNFULFILLED_DEPENDENCY_RESPONSE } from 'core/status'

export default class DIDsAPI {

    constructor(dataSource) {
        this.ds = dataSource
    }

    createFromJSON(jsonObj) {
        const response = this.ds.withCollection('gateways').find("@.metadata.ref=='" + jsonObj.metadata.gwRef + "'")

        if (response.result.length == 0) {
            return UNFULFILLED_DEPENDENCY_RESPONSE
        }

        return this.didExist(jsonObj.spec.location.telUrl)?
          CoreUtils.buildResponse(Status.CONFLICT):this.ds.insert(jsonObj)
    }

    updateFromJSON(jsonObj) {
        const response = this.ds.withCollection('gateways').find("@.metadata.ref=='" + jsonObj.metadata.gwRef + "'")

        if (response.result.length == 0) {
            return UNFULFILLED_DEPENDENCY_RESPONSE
        }

        return !this.didExist(jsonObj.spec.location.telUrl)?
          CoreUtils.buildResponse(Status.NOT_FOUND) : this.ds.update(jsonObj)
    }

    getDIDs(filter) {
        return this.ds.withCollection('dids').find(filter)
    }

    getDID(ref) {
        return DSUtil.deepSearch(this.getDIDs(), "metadata.ref", ref)
    }

    /**
     * note: telUrl maybe a string in form of 'tel:${number}' or
     * a TelURL Object.
     */
    getDIDByTelUrl(telUrl) {
        return DSUtil.deepSearch(this.getDIDs(), "spec.location.telUrl", telUrl)
    }

    didExist(telUrl) {
        return DSUtil.objExist(this.getDIDByTelUrl(telUrl))
    }

    deleteDID(ref) {
        return this.ds.withCollection('dids').remove(ref)
    }

}
