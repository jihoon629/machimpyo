package main

import (
	"encoding/json"
	"fmt"
	"time"
	// "github.com/google/uuid" // UUID는 이제 ID를 직접 받으므로 필요 없을 수 있음
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// ABstore Chaincode implementation
type ABstore struct {
	contractapi.Contract
}

// ImageMetadata 구조체: 각 이미지의 메타데이터를 저장
type ImageMetadata struct {
	ImageHash        string `json:"imageHash"`
	ImageOffChainRef string `json:"imageOffChainRef"`
	FileName         string `json:"fileName"` // <--- omitempty 제거!
}
// Will defines the structure for a digital will.
type Will struct {
	ID                 string          `json:"id"`
	TestatorID         string          `json:"testatorId"`
	Title              string          `json:"title"`
	ContentHash        string          `json:"contentHash"`
	OffChainStorageRef string          `json:"offChainStorageRef"`
	Beneficiaries      []string        `json:"beneficiaries"`
	CreatedAt          string          `json:"createdAt"`
	Images             []ImageMetadata `json:"images"`   // omitempty 제거
	Status             string          `json:"status"`   // omitempty 제거
	TransactionID      string          `json:"transactionId"`// omitempty 제거
	ObjectType         string          `json:"docType"`  // omitempty 제거 (json 태그 이름도 docType)
}

// InitLedger is called when the chaincode is instantiated or upgraded.
func (s *ABstore) InitLedger(ctx contractapi.TransactionContextInterface) error {
	fmt.Println("ABstore: InitLedger invoked")
	return nil
}

// RegisterWill creates a new digital will on the ledger.
func (s *ABstore) RegisterWill(ctx contractapi.TransactionContextInterface,
	id string, // 유언장 고유 ID (MariaDB Wills 테이블의 ID와 일치)
	testatorID string,
	title string,
	contentHash string, // 텍스트 유언 내용 해시 (필수)
	offChainStorageRef string, // MariaDB Wills 테이블 ID (텍스트 유언)
	beneficiariesJSON string, // 수혜자 목록 (JSON 문자열)
	imagesJSON string) (string, error) { // 이미지 메타데이터 배열 (JSON 문자열)

	fmt.Printf("ABstore.RegisterWill: Attempting to register will ID '%s' for TestatorID '%s', Title '%s'\n", id, testatorID, title)
	fmt.Printf("ContentHash (first 10): '%s...'\n", firstN(contentHash, 10))
	fmt.Printf("OffChainStorageRef: '%s'\n", offChainStorageRef)
	fmt.Printf("BeneficiariesJSON: '%s'\n", beneficiariesJSON)
	fmt.Printf("ImagesJSON: '%s'\n", imagesJSON)

	if id == "" {
		return "", fmt.Errorf("id (will ID) cannot be empty")
	}
	if testatorID == "" {
		return "", fmt.Errorf("testatorID cannot be empty")
	}
	if title == "" {
		return "", fmt.Errorf("title cannot be empty")
	}
	if contentHash == "" {
		return "", fmt.Errorf("contentHash cannot be empty")
	}
	if offChainStorageRef == "" { // MariaDB Wills 테이블 ID도 필수라고 가정
		return "", fmt.Errorf("offChainStorageRef (DB reference for text will) cannot be empty")
	}


	// ID 중복 검사
	existingWillBytes, err := ctx.GetStub().GetState(id)
	if err != nil {
		return "", fmt.Errorf("failed to read from world state for ID '%s': %w", id, err)
	}
	if existingWillBytes != nil {
		return "", fmt.Errorf("will with ID '%s' already exists", id)
	}

	var beneficiaries []string
	if beneficiariesJSON != "" { // 빈 문자열이 아닐 때만 언마샬링 시도
		err = json.Unmarshal([]byte(beneficiariesJSON), &beneficiaries)
		if err != nil {
			return "", fmt.Errorf("failed to unmarshal beneficiaries JSON string '%s': %w", beneficiariesJSON, err)
		}
	}

	var images []ImageMetadata
	if imagesJSON != "" && imagesJSON != "[]" { // 비어있거나 빈 배열 "[]" 문자열이 아닌 경우에만 처리
		err = json.Unmarshal([]byte(imagesJSON), &images)
		if err != nil {
			return "", fmt.Errorf("failed to unmarshal images JSON string. Input was: '%s'. Error: %w", imagesJSON, err)
		}
	}

	txID := ctx.GetStub().GetTxID() // 현재 트랜잭션 ID 가져오기

	will := Will{
		ID:                 id,
		TestatorID:         testatorID,
		Title:              title,
		ContentHash:        contentHash,
		OffChainStorageRef: offChainStorageRef,
		Beneficiaries:      beneficiaries,
		CreatedAt:          time.Now().UTC().Format(time.RFC3339), // ISO 8601 형식 타임스탬프
		Images:             images,
		Status:             "REGISTERED", // 또는 "ACTIVE" 등 초기 상태
		TransactionID:      txID,
		ObjectType:         "Will", // "will"에서 "Will"로 변경 (일관성)
	}

	willJSON, err := json.Marshal(will)
	if err != nil {
		return "", fmt.Errorf("failed to marshal will struct to JSON for ID '%s': %w", id, err)
	}

	err = ctx.GetStub().PutState(id, willJSON)
	if err != nil {
		return "", fmt.Errorf("failed to put will '%s' to world state: %w", id, err)
	}

	fmt.Printf("ABstore.RegisterWill: Successfully registered will ID '%s' for testator '%s'. TransactionID: %s\n", id, testatorID, txID)
	return fmt.Sprintf("Will '%s' registered successfully. Transaction ID: %s", id, txID), nil
}

// GetWillDetails retrieves a specific will by its ID from the ledger.
// username 파라미터는 접근 제어용으로 유지.
func (s *ABstore) GetWillDetails(ctx contractapi.TransactionContextInterface, willID string, username string) (*Will, error) {
	fmt.Printf("ABstore.GetWillDetails: Attempting to retrieve will with ID '%s' for user '%s'\n", willID, username)

	if willID == "" {
		return nil, fmt.Errorf("willID cannot be empty")
	}
    if username == "" { 
        return nil, fmt.Errorf("username for access control cannot be empty")
    }

	willJSON, err := ctx.GetStub().GetState(willID)
	if err != nil {
		return nil, fmt.Errorf("failed to read will '%s' from world state: %w", willID, err)
	}
	if willJSON == nil {
		return nil, fmt.Errorf("will '%s' does not exist", willID)
	}

	var will Will
	err = json.Unmarshal(willJSON, &will)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON for will '%s': %w", willID, err)
	}

	if will.TestatorID != username {
		return nil, fmt.Errorf("access denied: user '%s' is not the testator ('%s') of will '%s'", username, will.TestatorID, willID)
	}

	// Images 필드가 nil인 경우 실제 타입에 맞게 빈 슬라이스로 초기화
	if will.Images == nil {
		fmt.Printf("ABstore.GetWillDetails: Initializing nil Images field to empty slice for Will ID '%s'\n", will.ID)
		will.Images = make([]ImageMetadata, 0) // 포인터(*) 제거하여 타입 일치시킴
	}

	fmt.Printf("ABstore.GetWillDetails: Successfully retrieved will ID '%s' (Testator: '%s', Images count: %d) for user '%s'\n", willID, will.TestatorID, len(will.Images), username)
	return &will, nil
}

// GetMyWills retrieves all wills created by the calling user (testator).
func (s *ABstore) GetMyWills(ctx contractapi.TransactionContextInterface, usernameAsTestatorID string) ([]*Will, error) {
	fmt.Printf("ABstore.GetMyWills: Retrieving all wills for testator (username) '%s'\n", usernameAsTestatorID)

	if usernameAsTestatorID == "" {
		return nil, fmt.Errorf("usernameAsTestatorID (for TestatorID) cannot be empty")
	}

	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to get state by range: %w", err)
	}
	defer resultsIterator.Close()

	var myWills []*Will
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			// 에러 발생 시 로그를 남기고 계속 진행하거나, 바로 에러 반환 결정 필요
			fmt.Printf("Warning: Failed to get next state from iterator for key '%s': %s. Skipping.\n", queryResponse.Key, err.Error())
			continue
		}

		var will Will
		// queryResponse.Value가 비어있는 경우를 대비한 방어 코드 추가
		if queryResponse.Value == nil {
			fmt.Printf("Warning: Empty value for key '%s'. Skipping.\n", queryResponse.Key)
			continue
		}

		if errUnmarshal := json.Unmarshal(queryResponse.Value, &will); errUnmarshal != nil {
			fmt.Printf("Warning: Failed to unmarshal data for key '%s' into Will object: %s. Value (first 50 bytes): '%s...'. Skipping.\n", queryResponse.Key, errUnmarshal.Error(), firstN(string(queryResponse.Value), 50) )
			continue
		}

		// 필터링 조건: ObjectType이 "Will"이고 (대소문자 일치 확인), TestatorID가 파라미터와 일치
		if will.ObjectType == "Will" && will.TestatorID == usernameAsTestatorID {
			// Images 필드가 nil인 경우 빈 슬라이스로 초기화
			if will.Images == nil {
				will.Images = make([]ImageMetadata, 0) // 포인터(*) 제거
			}
			myWills = append(myWills, &will)
		}
	}

	if len(myWills) == 0 {
		fmt.Printf("ABstore.GetMyWills: No wills found for testator (username) '%s'\n", usernameAsTestatorID)
	} else {
		fmt.Printf("ABstore.GetMyWills: Found %d wills for testator (username) '%s'\n", len(myWills), usernameAsTestatorID)
	}
	return myWills, nil // 각 Will 객체에 Images 필드가 포함되어 반환됨
}

// getSubmitterID is not used in the current version of RegisterWill, GetWillDetails, GetMyWills.
// If needed elsewhere, it can be kept. Otherwise, it can be removed.
/*
func getSubmitterID(ctx contractapi.TransactionContextInterface) (string, error) {
	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return "", fmt.Errorf("failed to get client ID from context: %w", err)
	}
	if clientID == "" {
		return "", fmt.Errorf("client ID is empty; cannot identify the submitter. Ensure client identity is correctly configured in the network and application")
	}
	return clientID, nil
}
*/

// Helper function to get the first N characters of a string (for logging long strings)
func firstN(s string, n int) string {
	if len(s) > n {
		return s[:n]
	}
	return s
}

// main function starts the chaincode in the container environment.
func main() {
	chaincode, err := contractapi.NewChaincode(new(ABstore))
	if err != nil {
		fmt.Printf("Error creating ABstore chaincode: %s\n", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting ABstore chaincode: %s\n", err.Error())
	}
}