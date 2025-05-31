'use strict';
const shim = require('fabric-shim');
const util = require('util'); // console.log 포맷팅 등에 사용 가능

const ABstore = class {

    // Initialize the chaincode
    async Init(stub) {
        console.info('========= ABstore Init (Shim Style) =========');

        try {
            // 초기 상태 설정이 필요하다면 여기에 stub.putState 호출
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

        let method = this[ret.fcn]; // fcn은 호출된 함수 이름 (예: "RegisterWill")
        if (!method) {
            console.error(`No function of name: ${ret.fcn} found`);
            return shim.error(`Function ${ret.fcn} not found.`);
        }

        try {
            // 'this' 컨텍스트를 바인딩하여 method를 호출하고, stub과 params를 전달합니다.
            let payload = await method.call(this, stub, ret.params);
            // payload가 Buffer가 아니면 Buffer로 변환 (shim.success는 Buffer를 기대)
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
     * params: [id, testatorId, title, contentHash, offChainStorageRef, designatedViewersJSON, imagesJSON]
     */
    async RegisterWill(stub, args) {
      console.info('--- RegisterWill ---');
      // 인자 개수 8개로 변경
      if (args.length !== 8) { 
          throw new Error('Incorrect number of arguments. Expecting 8 for RegisterWill (id, testatorId, title, contentHash, offChainStorageRef, designatedViewersJSON, imagesJSON, createdAtString).');
      }

      // createdAtString 인자 추가
      const [id, testatorId, title, contentHash, offChainStorageRef, designatedViewersJSON, imagesJSON, createdAtString] = args;

      console.info(`Attempting to register will ID '${id}' for TestatorID '${testatorId}', Title '${title}'`);
      console.info(`DesignatedViewersJSON: '${designatedViewersJSON}'`);
      console.info(`ImagesJSON: '${imagesJSON}'`);
      console.info(`CreatedAtString (from client): '${createdAtString}'`); // 로그 추가

      // 유효성 검사: createdAtString도 비어있지 않은지 확인 (선택 사항이지만 권장)
      if (!id || !testatorId || !title || !contentHash || !offChainStorageRef || !createdAtString) {
          throw new Error('All required fields (id, testatorId, title, contentHash, offChainStorageRef, createdAtString) cannot be empty');
      }

      // ... (기존 existingWillBytes, designatedViewers, images 처리 로직은 동일) ...
      // ... (기존 코드 생략) ...
       let designatedViewers = [];
      if (designatedViewersJSON && designatedViewersJSON !== "[]") {
          try {
              const viewersData = JSON.parse(designatedViewersJSON);
              if (Array.isArray(viewersData)) {
                  designatedViewers = viewersData;
              } else {
                  throw new Error('Designated viewers JSON string must be an array.');
              }
          } catch (e) {
              throw new Error(`Failed to unmarshal designated viewers JSON string '${designatedViewersJSON}': ${e.message}`);
          }
      }

      let images = [];
      if (imagesJSON && imagesJSON !== "[]") {
          try {
              const imagesData = JSON.parse(imagesJSON);
              if (Array.isArray(imagesData)) {
                  images = imagesData;
              } else {
                  throw new Error('Images JSON string must be an array.');
              }
          } catch (e) {
              throw new Error(`Failed to unmarshal images JSON string. Input was: '${imagesJSON}'. Error: ${e.message}`);
          }
      }


      const txId = stub.getTxID();
      // const createdAt = new Date().toISOString(); // <--- 이 줄을 제거!

      const will = {
          docType: 'Will',
          id: id,
          testatorId: testatorId,
          title: title,
          contentHash: contentHash,
          offChainStorageRef: offChainStorageRef,
          designatedViewers: designatedViewers,
          createdAt: createdAtString, // 클라이언트에서 전달받은 시간 사용
          images: images,
          status: "REGISTERED",
          transactionId: txId,
      };

      await stub.putState(id, Buffer.from(JSON.stringify(will)));
      console.info(`Successfully registered will ID '${id}'. TransactionID: ${txId}`);
      return `Will '${id}' registered successfully. Transaction ID: ${txId}`;
  }
    /**
     * GetWillDetails (shim 스타일)
     * params: [willID, requesterUsername, viewerIdentityJSON]
     */
    async GetWillDetails(stub, args) {
        console.info('--- GetWillDetails ---');
        if (args.length !== 3) {
            throw new Error('Incorrect number of arguments. Expecting 3 for GetWillDetails.');
        }
        const [willID, requesterUsername, viewerIdentityJSON] = args;

        console.info(`Attempting to retrieve will with ID '${willID}' by requesterUsername '${requesterUsername}'`);
        console.info(`ViewerIdentityJSON: '${viewerIdentityJSON}'`);

        if (!willID) throw new Error('willID cannot be empty');
        if (!requesterUsername) throw new Error('requesterUsername cannot be empty');

        const willJSON = await stub.getState(willID);
        if (!willJSON || willJSON.length === 0) {
            throw new Error(`Will '${willID}' does not exist`);
        }

        let will;
        try {
            will = JSON.parse(willJSON.toString());
        } catch (e) {
            throw new Error(`Failed to unmarshal JSON for will '${willID}': ${e.message}`);
        }

        const isTestator = will.testatorId === requesterUsername;
        let isDesignatedViewer = false;

        if (!isTestator) {
            if (!viewerIdentityJSON) {
                throw new Error('viewerIdentityJSON cannot be empty when requester is not the testator');
            }
            let requestingViewer;
            try {
                requestingViewer = JSON.parse(viewerIdentityJSON);
            } catch (e) {
                throw new Error(`Failed to unmarshal viewerIdentityJSON '${viewerIdentityJSON}': ${e.message}`);
            }
            if (!requestingViewer.name || !requestingViewer.phone) {
                throw new Error("viewerIdentityJSON must contain non-empty 'name' and 'phone' fields");
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
            throw new Error(`Access denied: user '${requesterUsername}' is neither the testator ('${will.testatorId}') nor a matching designated viewer of will '${willID}'`);
        }

        will.images = will.images || [];
        will.designatedViewers = will.designatedViewers || [];

        console.info(`Successfully retrieved will ID '${willID}'`);
        // shim.success는 Buffer를 기대하므로, 객체를 문자열화하여 Buffer로 변환
        return Buffer.from(JSON.stringify(will));
    }

    /**
     * GetMyWills (shim 스타일)
     * params: [usernameAsTestatorID]
     */
    async GetMyWills(stub, args) {
        console.info('--- GetMyWills ---');
        console.log("해치웠나");
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting 1 for GetMyWills (usernameAsTestatorID).');
        }
        const usernameAsTestatorID = args[0];
        console.info(`Retrieving all wills for testator (username) '${usernameAsTestatorID}'`);

        if (!usernameAsTestatorID) {
            throw new Error('usernameAsTestatorID cannot be empty');
        }

        const iterator = await stub.getStateByRange('', ''); // 모든 키 조회
        const myWills = [];
        let result = await iterator.next();
        while (!result.done) {
            if (result.value && result.value.value.length > 0) {
                const strValue = result.value.value.toString('utf8');
                try {
                    const record = JSON.parse(strValue);
                    if (record.docType === 'Will' && record.testatorId === usernameAsTestatorID) {
                        record.images = record.images || [];
                        record.designatedViewers = record.designatedViewers || [];
                        myWills.push(record);
                    }
                } catch (err) {
                    console.warn(`Warning: Failed to unmarshal data for key '${result.value.key}'. Skipping. Error: ${err.message}`);
                }
            }
            result = await iterator.next();
        }
        await iterator.close();

        console.info(`Found ${myWills.length} wills for testator '${usernameAsTestatorID}'`);
        return Buffer.from(JSON.stringify(myWills));
    }

    /**
     * GetWillsViewableByMe (shim 스타일)
     * params: [viewerIdentityJSON]
     */
    async GetWillsViewableByMe(stub, args) {
        console.info('--- GetWillsViewableByMe ---');
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting 1 for GetWillsViewableByMe (viewerIdentityJSON).');
        }
        const viewerIdentityJSON = args[0];
        console.info(`Attempting to retrieve wills viewable by viewer: ${viewerIdentityJSON}`);

        if (!viewerIdentityJSON) {
            throw new Error('viewerIdentityJSON cannot be empty');
        }

        let requestingViewer;
        try {
            requestingViewer = JSON.parse(viewerIdentityJSON);
        } catch (e) {
            throw new Error(`Failed to unmarshal viewerIdentityJSON '${viewerIdentityJSON}': ${e.message}`);
        }
        if (!requestingViewer.name || !requestingViewer.phone) {
            throw new Error("viewerIdentityJSON must contain non-empty 'name' and 'phone' fields");
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
                                will.images = will.images || [];
                                will.designatedViewers = will.designatedViewers || [];
                                viewableWills.push(will);
                                break;
                            }
                        }
                    }
                } catch (err) {
                    console.warn(`Warning: Failed to unmarshal data for key '${result.value.key}'. Skipping. Error: ${err.message}`);
                }
            }
            result = await iterator.next();
        }
        await iterator.close();

        console.info(`Found ${viewableWills.length} wills viewable by Name: ${requestingViewer.name}, Phone: ${requestingViewer.phone}`);
        return Buffer.from(JSON.stringify(viewableWills));
    }
};

shim.start(new ABstore());