'use strict';
const shim = require('fabric-shim');
const util = require('util'); // console.log 포맷팅 등에 사용 가능

const ABstore = class {

    // Initialize the chaincode
    async Init(stub) {
        console.info('========= ABstore Init (Shim Style) =========');
        try {
            console.info('Chaincode Init successful');
            return shim.success();
        } catch (err) {
            console.error('Failed to initialize chaincode:', err);
            return shim.error(err.toString());
        }
    }

    async Invoke(stub) {
        console.info('========= ABstore Invoke (Shim Style) =========');
        let ret = stub.getFunctionAndParameters();
        console.info('Function and Parameters:', ret);

        let method = this[ret.fcn];
        if (!method) {
            console.error(`No function of name: ${ret.fcn} found`);
            return shim.error(`Function ${ret.fcn} not found.`);
        }

        try {
            let payload = await method.call(this, stub, ret.params);
            if (payload && !(payload instanceof Buffer)) {
                payload = Buffer.from(payload.toString());
            }
            return shim.success(payload);
        } catch (err) {
            console.error(`Error invoking ${ret.fcn}:`, err);
            return shim.error(err.toString());
        }
    }

    // --- 트랜잭션 함수들 ---

    /**
     * RegisterWill (shim 스타일)
     * params: [
     *   hashedId,
     *   hashedTestatorId,
     *   hashedTitle,
     *   contentHash (original content's hash),
     *   originalOffChainStorageRef,
     *   hashedDesignatedViewersDataString (JSON string of array with hashed name/phone),
     *   hashedImagesJSON (hash of the entire images JSON string - NOT to be parsed here),
     *   hashedCreatedAtString
     * ]
     */
    async RegisterWill(stub, args) {
      console.info('--- RegisterWill ---');
      if (args.length !== 8) {
          throw new Error('Incorrect number of arguments. Expecting 8 for RegisterWill.');
      }

      const [
          hashedId,
          hashedTestatorId,
          hashedTitle,
          contentHash,
          originalOffChainStorageRef,
          hashedDesignatedViewersDataString,
          hashedImagesJSON, // This is a HASH, not a JSON string to be parsed.
          hashedCreatedAtString
        ] = args;

      console.info(`Attempting to register will with HASHED ID '${hashedId}'`);
      console.info(`HashedTestatorId: '${hashedTestatorId}'`);
      console.info(`HashedTitle: '${hashedTitle}'`);
      console.info(`ContentHash: '${contentHash}'`);
      console.info(`OriginalOffChainStorageRef: '${originalOffChainStorageRef}'`);
      console.info(`HashedDesignatedViewersDataString (to be parsed): '${hashedDesignatedViewersDataString}'`);
      console.info(`HashedImagesJSON (to be stored as is): '${hashedImagesJSON}'`);
      console.info(`HashedCreatedAtString: '${hashedCreatedAtString}'`);

      if (!hashedId || !hashedTestatorId || !hashedTitle || !contentHash || !originalOffChainStorageRef || !hashedCreatedAtString) {
          throw new Error('Required hashed/original fields (hashedId, hashedTestatorId, hashedTitle, contentHash, originalOffChainStorageRef, hashedCreatedAtString) cannot be empty');
      }
      // hashedImagesJSON은 여기서 검증할 필요는 없지만, 빈 문자열이 올 수도 있음을 인지.

      let designatedViewersForStorage = [];
      // hashedDesignatedViewersDataString 은 "[{"name":"hash1","phone":"hash2"}]" 형태의 문자열이므로 파싱 가능
      if (hashedDesignatedViewersDataString && hashedDesignatedViewersDataString !== "[]") { // "[]"는 빈 배열의 JSON 문자열
          try {
              designatedViewersForStorage = JSON.parse(hashedDesignatedViewersDataString);
              if (!Array.isArray(designatedViewersForStorage)) {
                   console.warn(`RegisterWill: Parsed designated viewers data (from hashedDesignatedViewersDataString) is not an array. Storing as empty array. Input: ${hashedDesignatedViewersDataString}`);
                   designatedViewersForStorage = [];
              }
          } catch (e) {
              throw new Error(`Failed to unmarshal HASHED designated viewers data string '${hashedDesignatedViewersDataString}': ${e.message}`);
          }
      }

      const txId = stub.getTxID();

      const will = {
          docType: 'Will', // 해시 안함
          id: hashedId,
          testatorId: hashedTestatorId,
          title: hashedTitle, // 해시된 제목
          contentHash: contentHash,
          offChainStorageRef: originalOffChainStorageRef, // 해시되지 않은 원본 참조
          designatedViewers: designatedViewersForStorage, // name/phone이 해시된 객체 배열
          images: hashedImagesJSON, // imagesJSON 전체가 해시된 문자열 (파싱 안함)
          createdAt: hashedCreatedAtString, // 해시된 생성 시간 문자열
          status: "REGISTERED", // 해시 안함 (체인코드에서 직접 설정)
          transactionId: txId,
      };

      await stub.putState(hashedId, Buffer.from(JSON.stringify(will)));
      console.info(`Successfully registered will with HASHED ID '${hashedId}'. TransactionID: ${txId}`);
      return `Will with HASHED ID '${hashedId}' registered successfully. Transaction ID: ${txId}`;
    }

    /**
     * GetWillDetails (shim 스타일)
     * params: [willID (실제로는 hashedWillID), requesterUsername (해시된 값이어야 함), viewerIdentityJSON (내부 name/phone이 해시된 값이어야 함)]
     * 참고: 이 함수는 해시된 데이터를 반환합니다. will.images는 해시된 문자열입니다.
     */
    async GetWillDetails(stub, args) {
        console.info('--- GetWillDetails ---');
        if (args.length !== 3) {
            throw new Error('Incorrect number of arguments. Expecting 3 for GetWillDetails (willID, requesterUsername, viewerIdentityJSON).');
        }
        const [hashedWillID, requesterUsernameToCompare, viewerIdentityJSONToCompare] = args;

        console.info(`Attempting to retrieve will with HASHED ID '${hashedWillID}' by requester (comparison value) '${requesterUsernameToCompare}'`);
        console.info(`ViewerIdentityJSON (comparison value): '${viewerIdentityJSONToCompare}'`);

        if (!hashedWillID) throw new Error('hashedWillID cannot be empty');

        const willJSON = await stub.getState(hashedWillID);
        if (!willJSON || willJSON.length === 0) {
            throw new Error(`Will with HASHED ID '${hashedWillID}' does not exist`);
        }

        let will;
        try {
            will = JSON.parse(willJSON.toString());
        } catch (e) {
            throw new Error(`Failed to unmarshal JSON for will (HASHED ID '${hashedWillID}'): ${e.message}`);
        }

        const isTestator = will.testatorId === requesterUsernameToCompare;
        let isDesignatedViewer = false;

        if (!isTestator) {
            if (!viewerIdentityJSONToCompare) {
                throw new Error('viewerIdentityJSONToCompare cannot be empty when requester is not the testator');
            }
            let requestingViewer;
            try {
                requestingViewer = JSON.parse(viewerIdentityJSONToCompare);
            } catch (e) {
                throw new Error(`Failed to unmarshal viewerIdentityJSONToCompare '${viewerIdentityJSONToCompare}': ${e.message}`);
            }
            if (!requestingViewer.name || !requestingViewer.phone) {
                throw new Error("viewerIdentityJSONToCompare must contain non-empty 'name' and 'phone' fields (expected to be hashed)");
            }

            if (will.designatedViewers && Array.isArray(will.designatedViewers)) {
                for (const designatedViewer of will.designatedViewers) {
                    if (designatedViewer.name === requestingViewer.name && designatedViewer.phone === requestingViewer.phone) {
                        isDesignatedViewer = true;
                        break;
                    }
                }
            }
        }

        if (!isTestator && !isDesignatedViewer) {
            throw new Error(`Access denied: Requester (compare value '${requesterUsernameToCompare}') is neither the testator (hashed '${will.testatorId}') nor a matching designated viewer of will (HASHED ID '${hashedWillID}')`);
        }

        // Ensure fields exist, images is a hash string, designatedViewers is an array (already parsed in RegisterWill)
        if (typeof will.images !== 'string') {
            console.warn(`GetWillDetails: will.images for HASHED ID ${hashedWillID} is not a string, setting to empty string. Value:`, will.images);
            will.images = ""; // Or a specific hash for "empty images list" if defined
        }
        if (!Array.isArray(will.designatedViewers)) {
            console.warn(`GetWillDetails: will.designatedViewers for HASHED ID ${hashedWillID} is not an array, setting to empty array. Value:`, will.designatedViewers);
            will.designatedViewers = [];
        }


        console.info(`Successfully retrieved will (HASHED ID '${hashedWillID}')`);
        return Buffer.from(JSON.stringify(will)); // will.images는 해시된 문자열 상태로 반환
    }

    /**
     * Helper function to ensure will object has default/correct types for certain fields before sending.
     * Modifies the record directly.
     */
    _normalizeWillRecord(record, recordKey) {
        if (typeof record.images !== 'string') {
             console.warn(`_normalizeWillRecord: record.images for key ${recordKey} is not a string, setting to empty string. Value:`, record.images);
            record.images = ""; // Default for images hash if not a string
        }
        if (!Array.isArray(record.designatedViewers)) {
            console.warn(`_normalizeWillRecord: record.designatedViewers for key ${recordKey} is not an array, setting to empty array. Value:`, record.designatedViewers);
            record.designatedViewers = [];
        }
        // Add other normalizations if needed
    }


    /**
     * GetMyWills (shim 스타일)
     * params: [hashedTestatorIdToSearch]
     * 참고: 이 함수는 해시된 데이터가 포함된 유언장 목록을 반환합니다. will.images는 해시된 문자열입니다.
     */
    async GetMyWills(stub, args) {
        console.info('--- GetMyWills ---');
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting 1 for GetMyWills (hashedTestatorIdToSearch).');
        }
        const hashedTestatorIdToSearch = args[0];
        console.info(`Retrieving all wills for HASHED testatorId '${hashedTestatorIdToSearch}'`);

        if (!hashedTestatorIdToSearch) {
            throw new Error('hashedTestatorIdToSearch cannot be empty');
        }

        const iterator = await stub.getStateByRange('', '');
        const myWills = [];
        let result = await iterator.next();
        while (!result.done) {
            if (result.value && result.value.value.length > 0) {
                const strValue = result.value.value.toString('utf8');
                try {
                    const record = JSON.parse(strValue);
                    if (record.docType === 'Will' && record.testatorId === hashedTestatorIdToSearch) {
                        this._normalizeWillRecord(record, result.value.key);
                        myWills.push(record);
                    }
                } catch (err) {
                    console.warn(`GetMyWills: Warning: Failed to unmarshal data for key '${result.value.key}'. Skipping. Error: ${err.message}`);
                }
            }
            result = await iterator.next();
        }
        await iterator.close();

        console.info(`Found ${myWills.length} wills for HASHED testatorId '${hashedTestatorIdToSearch}'`);
        return Buffer.from(JSON.stringify(myWills)); // will.images는 해시된 문자열 상태로 반환
    }

    /**
     * GetWillsViewableByMe (shim 스타일)
     * params: [viewerIdentityJSONWithHashedNamePhone] (내부 name, phone이 해시된 JSON 문자열)
     * 참고: 이 함수는 해시된 데이터가 포함된 유언장 목록을 반환합니다. will.images는 해시된 문자열입니다.
     */
    async GetWillsViewableByMe(stub, args) {
        console.info('--- GetWillsViewableByMe ---');
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting 1 for GetWillsViewableByMe (viewerIdentityJSONWithHashedNamePhone).');
        }
        const viewerIdentityJSONWithHashedNamePhone = args[0];
        console.info(`Attempting to retrieve wills viewable by viewer (with hashed name/phone): ${viewerIdentityJSONWithHashedNamePhone}`);

        if (!viewerIdentityJSONWithHashedNamePhone) {
            throw new Error('viewerIdentityJSONWithHashedNamePhone cannot be empty');
        }

        let requestingViewer;
        try {
            requestingViewer = JSON.parse(viewerIdentityJSONWithHashedNamePhone);
        } catch (e) {
            throw new Error(`Failed to unmarshal viewerIdentityJSONWithHashedNamePhone '${viewerIdentityJSONWithHashedNamePhone}': ${e.message}`);
        }
        if (!requestingViewer.name || !requestingViewer.phone) {
            throw new Error("viewerIdentityJSONWithHashedNamePhone must contain non-empty 'name' and 'phone' fields (expected to be hashed)");
        }

        const iterator = await stub.getStateByRange('', '');
        const viewableWills = [];
        let result = await iterator.next();
        while (!result.done) {
             if (result.value && result.value.value.length > 0) {
                const strValue = result.value.value.toString('utf8');
                try {
                    const will = JSON.parse(strValue);
                    if (will.docType === 'Will' && Array.isArray(will.designatedViewers)) {
                        for (const designatedViewer of will.designatedViewers) {
                            if (designatedViewer.name === requestingViewer.name && designatedViewer.phone === requestingViewer.phone) {
                                this._normalizeWillRecord(will, result.value.key);
                                viewableWills.push(will);
                                break;
                            }
                        }
                    }
                } catch (err) {
                    console.warn(`GetWillsViewableByMe: Warning: Failed to unmarshal data for key '${result.value.key}'. Skipping. Error: ${err.message}`);
                }
            }
            result = await iterator.next();
        }
        await iterator.close();

        console.info(`Found ${viewableWills.length} wills viewable by HASHED Name: ${requestingViewer.name}, HASHED Phone: ${requestingViewer.phone}`);
        return Buffer.from(JSON.stringify(viewableWills)); // will.images는 해시된 문자열 상태로 반환
    }

    /**
     * Helper function to get all wills from the ledger.
     * Returns wills with hashed fields. will.images is a hash string.
     */
    async _getAllWillsFromLedger(stub) {
        console.info('--- _getAllWillsFromLedger (Helper) ---');
        const iterator = await stub.getStateByRange('', '');
        const allWills = [];
        let result = await iterator.next();
        while (!result.done) {
            if (result.value && result.value.value.length > 0) {
                const strValue = result.value.value.toString('utf8');
                try {
                    const record = JSON.parse(strValue);
                    if (record.docType === 'Will') {
                        this._normalizeWillRecord(record, result.value.key);
                        allWills.push(record);
                    }
                } catch (err) {
                    console.warn(`_getAllWillsFromLedger: Warning: Failed to unmarshal data for key '${result.value.key}'. Skipping. Error: ${err.message}`);
                }
            }
            result = await iterator.next();
        }
        await iterator.close();
        console.info(`_getAllWillsFromLedger: Retrieved ${allWills.length} 'Will' documents (with hashed fields).`);
        return allWills;
    }

    /**
     * GetAllWillsByAdmin (shim 스타일)
     * params: [adminToken]
     * 참고: 이 함수는 해시된 데이터가 포함된 유언장 목록을 반환합니다. will.images는 해시된 문자열입니다.
     */
    async GetAllWillsByAdmin(stub, args) {
        console.info('--- GetAllWillsByAdmin ---');
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting 1 for GetAllWillsByAdmin (adminToken).');
        }
        const [adminToken] = args;

        console.info(`Attempting to fetch all wills using token: '${adminToken}'`);
        const ADMIN_ACCESS_KEY = "admin"; // 실제 환경에서는 환경 변수 등으로 관리
        if (adminToken !== ADMIN_ACCESS_KEY) {
            throw new Error(`Unauthorized: Invalid admin token provided for GetAllWillsByAdmin. Access denied.`);
        }
        console.info('GetAllWillsByAdmin: Admin token validated successfully.');

        const allWillsList = await this._getAllWillsFromLedger(stub);

        console.info(`GetAllWillsByAdmin: Found ${allWillsList.length} wills in total (with hashed fields).`);
        return Buffer.from(JSON.stringify(allWillsList)); // will.images는 해시된 문자열 상태로 반환
    }

    /**
     * GetWillDetailsByAdmin (shim 스타일)
     * params: [adminToken, hashedWillID]
     * 참고: 이 함수는 해시된 데이터를 반환합니다. will.images는 해시된 문자열입니다.
     */
    async GetWillDetailsByAdmin(stub, args) {
        console.info('--- GetWillDetailsByAdmin ---');
        if (args.length !== 2) {
            throw new Error('Incorrect number of arguments. Expecting 2 for GetWillDetailsByAdmin (adminToken, hashedWillID).');
        }
        const [adminToken, hashedWillID] = args;

        console.info(`Attempting to retrieve will with HASHED ID '${hashedWillID}' using admin token: '${adminToken}'`);
        const ADMIN_ACCESS_KEY = "admin"; // 실제 환경에서는 환경 변수 등으로 관리
        if (adminToken !== ADMIN_ACCESS_KEY) {
            throw new Error(`Unauthorized: Invalid admin token provided for GetWillDetailsByAdmin. Access denied.`);
        }
        console.info('GetWillDetailsByAdmin: Admin token validated successfully.');

        if (!hashedWillID) {
            throw new Error('hashedWillID cannot be empty for GetWillDetailsByAdmin');
        }

        const willJSON = await stub.getState(hashedWillID);
        if (!willJSON || willJSON.length === 0) {
            throw new Error(`Will with HASHED ID '${hashedWillID}' does not exist (checked by admin).`);
        }

        let will;
        try {
            will = JSON.parse(willJSON.toString());
        } catch (e) {
            throw new Error(`Failed to unmarshal JSON for will (HASHED ID '${hashedWillID}', admin request): ${e.message}`);
        }

        this._normalizeWillRecord(will, hashedWillID);

        console.info(`Successfully retrieved will (HASHED ID '${hashedWillID}') by admin.`);
        return Buffer.from(JSON.stringify(will)); // will.images는 해시된 문자열 상태로 반환
    }

    /**
     * UpdateWillStatusByAdmin (shim 스타일)
     * params: [hashedWillID, newStatus, adminToken]
     * 참고: newStatus는 해시되지 않은 원본 상태 문자열 (예: "ACTIVE")
     */
    async UpdateWillStatusByAdmin(stub, args) {
        console.info('--- UpdateWillStatusByAdmin ---');
        if (args.length !== 3) {
            throw new Error('Incorrect number of arguments. Expecting 3 for UpdateWillStatusByAdmin (hashedWillID, newStatus, adminToken).');
        }
        const [hashedWillID, newStatus, adminToken] = args;

        console.info(`Attempting to update status of will (HASHED ID '${hashedWillID}') to '${newStatus}' using token: '${adminToken}'`);
        const ADMIN_ACCESS_KEY = "admin"; // 실제 환경에서는 환경 변수 등으로 관리
        if (adminToken !== ADMIN_ACCESS_KEY) {
            throw new Error(`Unauthorized: Invalid admin token provided. Access denied for updating will status.`);
        }
        console.info('Admin token validated successfully.');

        if (!hashedWillID) throw new Error('hashedWillID cannot be empty');
        if (!newStatus) throw new Error('newStatus cannot be empty');

        // 실제 프로젝트에서는 상태 전이 로직이 더 복잡할 수 있음
        const allowedStatuses = {"REGISTERED": true, "ACTIVE": true, "EXPIRED": true, "EXECUTED": true, "REVOKED": true};
        if (!allowedStatuses[newStatus]) {
            throw new Error(`Invalid newStatus: '${newStatus}'. Allowed statuses are: ${Object.keys(allowedStatuses).join(', ')}`);
        }

        const willJSONBytes = await stub.getState(hashedWillID);
        if (!willJSONBytes || willJSONBytes.length === 0) {
            throw new Error(`Will with HASHED ID '${hashedWillID}' does not exist`);
        }

        let will;
        try {
            will = JSON.parse(willJSONBytes.toString());
        } catch (e) {
            throw new Error(`Failed to unmarshal JSON for will (HASHED ID '${hashedWillID}'): ${e.message}`);
        }

        console.info(`Current status of will (HASHED ID '${hashedWillID}') is '${will.status}'. Updating to '${newStatus}'.`);
        will.status = newStatus; // status 필드는 해시하지 않음

        await stub.putState(hashedWillID, Buffer.from(JSON.stringify(will)));
        console.info(`Successfully updated status of will (HASHED ID '${hashedWillID}') to '${newStatus}'`);
        return Buffer.from(`Status of will (HASHED ID '${hashedWillID}') updated to '${newStatus}' successfully.`);
    }
};
shim.start(new ABstore());