// ... (기존 import 구문들)
import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import './WillWritePageCss/WillWritePage.css'; // CSS 파일 경로는 실제 프로젝트 구조에 맞게 확인해주세요.
import { useNavigate } from 'react-router-dom';
import willService from '../services/willService'; // willService 임포트 확인


const WillWritePage = () => {
  const navigate = useNavigate();
  const [viewers, setViewers] = useState([]);
  const [blockchain, setBlockchain] = useState(false); // 이 상태는 현재 handleSubmit에서 직접 사용되지 않음
  const [publicReq, setPublicReq] = useState(false); // 이 상태는 현재 handleSubmit에서 직접 사용되지 않음
  
  // 여러 이미지 파일을 위한 상태로 변경
  const [imageFilesToUpload, setImageFilesToUpload] = useState([]); // 단일 파일 -> 파일 배열
  
  const [content, setContent] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // UI 진행 상태 표시용
  const [willTitle, setWillTitle] = useState("");
  
  const [testatorDisplayRealName, setTestatorDisplayRealName] = useState(""); 
  const [sessionUsername, setSessionUsername] = useState(""); 
  const [isLoadingRealName, setIsLoadingRealName] = useState(true);

  const [apiStatus, setApiStatus] = useState({
    loading: false,
    error: null,
    data: null,
  });
  const [ocrInProgress, setOcrInProgress] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const [uploadedFileNames, setUploadedFileNames] = useState([]); // 화면 표시용 파일 이름들


  useEffect(() => {
    const usernameFromSession = sessionStorage.getItem('username');
    if (usernameFromSession) {
      setSessionUsername(usernameFromSession);
      setIsLoadingRealName(true);
      willService.queryByName(usernameFromSession)
        .then(response => {
          setTestatorDisplayRealName(response.data.realName || usernameFromSession);
          setIsLoadingRealName(false);
        })
        .catch(error => {
          console.error("실명 조회 실패:", error);
          setTestatorDisplayRealName(usernameFromSession); // 실패 시 username으로 대체
          setIsLoadingRealName(false);
        });
    } else {
      setTestatorDisplayRealName("로그인 필요"); // 또는 로그인 페이지로 리다이렉트
      setIsLoadingRealName(false);
      // navigate('/login'); // 예시: 로그인 안되어 있으면 로그인 페이지로
    }
  }, []); // navigate를 의존성 배열에 추가하면 로그인/로그아웃 시 동작이 달라질 수 있으므로 주의

  const handleFileChange = async (e) => {
    const newFiles = Array.from(e.target.files); // 새로 선택된 파일들
    console.log("Newly selected files:", newFiles);
    console.log("Number of newly selected files:", newFiles.length);

    if (newFiles.length > 0) {
      // 기존 파일 목록과 새로 선택된 파일 목록을 합칩니다.
      // 중복 파일 처리가 필요하다면 여기서 로직을 추가할 수 있습니다. (예: 파일 이름으로 비교)
      // 현재는 단순 병합합니다.
      const updatedFilesToUpload = [...imageFilesToUpload, ...newFiles];
      const updatedFileNames = updatedFilesToUpload.map(f => f.name);

      console.log("Updated files to upload:", updatedFilesToUpload);
      console.log("Updated file names for display:", updatedFileNames);

      setImageFilesToUpload(updatedFilesToUpload);
      setUploadedFileNames(updatedFileNames);

      // OCR은 여전히 첫 번째 파일 또는 새로 추가된 파일 중 첫 번째 등으로 정책 결정
      const fileToProcessForOCR = newFiles[0]; // 새로 추가된 파일 중 첫 번째로 OCR 진행
                                            // 또는 updatedFilesToUpload[0] (전체 목록의 첫 번째) 등
      
      setOcrInProgress(true);
      setOcrError(null);
      try {
        const response = await willService.extractTextFromImage(fileToProcessForOCR);
        const result = response.data;
        if (result.text !== undefined) {
          setContent(prevContent => prevContent ? `${prevContent}\n${result.text}` : result.text);
          if (result.text.trim() !== "" && currentStep < 2 && willTitle.trim() !== "" && testatorDisplayRealName.trim() !== "" && testatorDisplayRealName !== "로그인 필요") {
            setCurrentStep(2);
          }
        } else {
          throw new Error("OCR API 응답에서 텍스트를 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("OCR 실패:", error);
        const errorMessage = error.response?.data?.error || error.message || "OCR 처리 중 알 수 없는 오류가 발생했습니다.";
        setOcrError(errorMessage);
      } finally {
        setOcrInProgress(false);
      }
    }
    // 파일 선택을 취소한 경우 (newFiles.length === 0) 또는
    // 파일을 선택하지 않고 '취소'를 누른 경우에는 기존 상태를 유지하거나 초기화할 수 있습니다.
    // 현재는 newFiles.length > 0 일 때만 상태를 업데이트하므로, 파일 선택 취소 시에는 아무 변화 없음.
    // 만약 선택 취소 시 모든 선택을 초기화하고 싶다면 아래 주석 해제:
    // else if (e.target.files.length === 0) { // 사용자가 파일 선택 창에서 '취소'를 누른 경우
    //   setImageFilesToUpload([]);
    //   setUploadedFileNames([]);
    // }
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    // 내용 입력 시 다음 단계로 자동 이동 로직 (선택 사항)
    if (value.trim() !== "" && currentStep < 2 && willTitle.trim() !== "" && testatorDisplayRealName.trim() !== "" && testatorDisplayRealName !== "로그인 필요") {
      setCurrentStep(2);
    }
  };

  const handleAddViewer = () => {
    const newViewer = { name: "새 열람자", desc: "관계", id: "0xNew...5678" }; // id는 실제로는 고유해야 함
    setViewers((prev) => {
        const validPrevViewers = Array.isArray(prev) ? prev.filter(v => v && v.name && v.id) : []; // prev가 배열인지 확인
        return [...validPrevViewers, newViewer];
    });
    // 열람자 추가 시 다음 단계로 자동 이동 로직 (선택 사항)
    if (currentStep < 3 && content.trim() !== "" && willTitle.trim() !== "" && testatorDisplayRealName.trim() !== "" && testatorDisplayRealName !== "로그인 필요") {
      setCurrentStep(3);
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setWillTitle(value);
    // 제목 입력 시 다음 단계로 자동 이동 로직 (선택 사항)
    if (value.trim() !== "" && content.trim() !== "" && sessionUsername && currentStep < 2) {
      setCurrentStep(2);
    } else if (value.trim() !== "" && sessionUsername && currentStep === 1 && (content.trim() === "")) { // 내용이 비어있을 때
      // 특별한 동작 없음, 사용자가 내용을 입력해야 2단계로 넘어감
    }
  };

  const handleSubmit = async () => {
    if (!willTitle || !content || !sessionUsername) {
      setApiStatus({ loading: false, error: "유언장 제목, 내용, 작성자 정보(로그인 상태)는 필수 항목입니다.", data: null });
      return;
    }

    // 이미지는 선택 사항으로 처리 (필수라면 아래 주석 해제 및 메시지 수정)
    // if (imageFilesToUpload.length === 0) {
    //   setApiStatus({ loading: false, error: "하나 이상의 유언장 이미지를 첨부해주세요.", data: null });
    //   return;
    // }

    setApiStatus({ loading: true, error: null, data: null });

    const formData = new FormData();
    formData.append('title', willTitle);
    formData.append('originalContent', content);
    
    // beneficiaries는 JSON 문자열로 변환하여 전송
    const beneficiariesArray = Array.isArray(viewers) ? viewers.filter(v => v && v.name).map(v => v.name) : [];
    formData.append('beneficiaries', JSON.stringify(beneficiariesArray));
    formData.append('testatorId', sessionUsername);

    // 여러 이미지 파일이 있는 경우 FormData에 추가
    if (imageFilesToUpload.length > 0) {
      imageFilesToUpload.forEach((file) => {
        // 백엔드 routes.js의 upload.array()에서 설정한 필드 이름 (예: 'imageFiles')
        formData.append('imageFiles', file, file.name); // file.name을 세 번째 인자로 전달하는 것이 좋음
      });
    }
    
    try {
      let response;
      // 이미지가 하나라도 첨부되었으면 registerWillWithImage 서비스 호출
      // (willService.js에서 API 엔드포인트가 /register-with-images 로 변경되었다고 가정)
      if (imageFilesToUpload.length > 0) { 
        response = await willService.registerWillWithImage(formData);
      } else {
        // 이미지가 없으면 기존 registerWill 서비스 호출 (텍스트 데이터만 전송)
        const textWillData = {
          title: willTitle,
          originalContent: content,
          beneficiaries: beneficiariesArray, // JSON 문자열이 아닌 배열 형태로 전달 가능 (서버에서 처리 방식에 따라 다름)
                                           // 여기서는 서버 service.js가 배열도 JSON.stringify 하므로 배열 전달
          testatorId: sessionUsername,
        };
        response = await willService.registerWill(textWillData);
      }
      
      // response.data가 객체이고, 그 안에 message나 다른 유용한 정보가 있을 수 있음
      const responseData = response.data || {};
      setApiStatus({ loading: false, error: null, data: responseData });
      console.log("등록 성공:", responseData);
      
      const successMessage = responseData.message || "유언장이 성공적으로 등록되었습니다.";
      navigate('/success', { state: { message: successMessage, details: responseData } });

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "유언장 등록 중 알 수 없는 오류가 발생했습니다.";
      setApiStatus({ loading: false, error: errorMessage, data: null });
      console.error("등록 실패:", error);
    }
  };
  
  // JSX 반환 부분은 이전 답변에서 제안한 JSX 구조를 사용합니다.
  // (제공해주신 코드에는 return (...); 부분이 이미 존재하므로, 그 내부를 수정합니다.)
  return (
    <div className="WillWritePage_Container">
      <h2 className="WillWritePage_Title">디지털 유언장 작성</h2>
      <div className="WillWritePage_Subtitle">작성 진행 상태</div>
      <div className="WillWritePage_StepProgress" style={{ "--progress": currentStep - 1 }}>
        <div className={`WillWritePage_StepProgress_StepItem ${currentStep >= 1 ? "active" : ""}`}>
          <div className="WillWritePage_StepProgress_Circle">1</div>
          <span className="WillWritePage_StepProgress_StepName">기본 정보</span>
        </div>
        <div className={`WillWritePage_StepProgress_StepItem ${currentStep >= 2 ? "active" : ""}`}>
          <div className="WillWritePage_StepProgress_Circle">2</div>
          <span className="WillWritePage_StepProgress_StepName">내용 작성</span>
        </div>
        <div className={`WillWritePage_StepProgress_StepItem ${currentStep >= 3 ? "active" : ""}`}>
          <div className="WillWritePage_StepProgress_Circle">3</div>
          <span className="WillWritePage_StepProgress_StepName">열람자 지정</span>
        </div>
        <div className={`WillWritePage_StepProgress_StepItem ${currentStep >= 4 ? "active" : ""}`}>
          <div className="WillWritePage_StepProgress_Circle">4</div>
          <span className="WillWritePage_StepProgress_StepName">최종 확인</span>
        </div>
      </div>

      <div className="WillWritePage_Section">
        <div className="WillWritePage_Label">기본 정보</div>
        <div className="WillWritePage_InlineInputs">
          <input className="WillWritePage_Input" placeholder="유언장 제목" value={willTitle} onChange={handleTitleChange} />
          <input 
            className="WillWritePage_Input" 
            placeholder="작성자 이름 (자동 입력)" 
            value={isLoadingRealName ? "실명 로딩 중..." : testatorDisplayRealName} 
            readOnly
          />
        </div>
      </div>

      <div className="WillWritePage_Section">
        <div className="WillWritePage_Label">유언장 내용</div>
        <textarea
          className="WillWritePage_TextArea"
          placeholder="유언장 내용을 작성해주세요..."
          value={content}
          onChange={handleContentChange}
        />
      </div>
      {/* 이미지 업로드 섹션 수정 */}
      <div className="WillWritePage_Section">
        <div className="WillWritePage_Label">자필 문서 스캔 / 유언장 첨부 이미지 (선택사항, 여러 장 가능)</div>
        <label htmlFor="handwritten-upload" className="WillWritePage_UploadBoxLabel">
          <FaUpload />
          <div>
            이곳에 파일을 끌어다 놓거나 클릭하여 업로드하세요
            <br />
            (선택된 모든 이미지가 첨부됩니다. OCR은 첫 번째 파일로 진행됩니다.)
            <br />
            지원 형식: JPG, PNG, WEBP 등 이미지 파일
          </div>
          <input
            id="handwritten-upload"
            type="file"
            accept="image/*"
            multiple // 여러 파일 선택 가능하도록 multiple 속성 추가
            onChange={handleFileChange}
            className="WillWritePage_UploadInput" // 이 클래스로 input 숨김 처리 및 스타일링
          />
        </label>
        <label htmlFor="handwritten-upload" className="WillWritePage_UploadButton">
          📎 문서/이미지 업로드하기
        </label>
        {ocrInProgress && <div style={{ marginTop: '10px', textAlign: 'center' }}>첫 번째 이미지 OCR 처리 중...</div>}
        {ocrError && <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>OCR 오류: {ocrError}</div>}
        
        {/* 업로드된 파일 이름 목록 표시 */}
        {uploadedFileNames.length > 0 && (
          <div className="WillWritePage_FilePreviewArea">
            <h4 className="WillWritePage_PreviewTitle">선택된 파일:</h4>
            <ul className="WillWritePage_FileNameList">
              {uploadedFileNames.map((fileName, index) => (
                <li key={index} className="WillWritePage_FileNameItem">{fileName}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* 열람자 지정 섹션 */}
      <div className="WillWritePage_Section">
        <div className="WillWritePage_Label">열람자 지정</div>
        {Array.isArray(viewers) && viewers.map((v, i) => ( // viewers가 배열인지 확인
          <div key={i} className="WillWritePage_ViewerItem">
            <div>
              {v.name} <span style={{ color: "#888" }}>– {v.desc}</span>
            </div>
            <div style={{ fontFamily: "monospace" }}>{v.id}</div>
          </div>
        ))}
        <button onClick={handleAddViewer} className="WillWritePage_AddViewerButton">
          + 열람자 추가
        </button>
      </div>

      {/* 고급 설정 섹션 */}
      <div className="WillWritePage_Section">
        <div className="WillWritePage_Label">고급 설정</div>
        <label className="WillWritePage_CheckboxLabel">
          <input
            type="checkbox"
            checked={blockchain}
            onChange={(e) => setBlockchain(e.target.checked)}
          />
          블록체인 등록 활성화
        </label>
        <label className="WillWritePage_CheckboxLabel">
          <input
            type="checkbox"
            checked={publicReq}
            onChange={(e) => setPublicReq(e.target.checked)}
          />
          공증 신청
        </label>
      </div>

      {/* 버튼 영역 */}
      <div className="WillWritePage_ButtonWrap">
        <button className="WillWritePage_Button WillWritePage_Button--save">임시 저장</button>
        <button 
            className="WillWritePage_Button WillWritePage_Button--submit" 
            onClick={handleSubmit} 
            disabled={apiStatus.loading || !willTitle || !content || !sessionUsername}
        >
          {apiStatus.loading ? "처리 중..." : "작성 완료"}
        </button>
      </div>

      {/* API 호출 상태 메시지 */}
      {apiStatus.error && <div className="WillWritePage_ApiError" style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>오류: {apiStatus.error}</div>}
      {apiStatus.data && <div className="WillWritePage_ApiSuccess" style={{ color: 'green', marginTop: '10px', textAlign: 'center' }}>
        {/* 서버 응답이 객체이고 message 필드가 있다면 그것을 표시, 아니면 전체 객체를 JSON 문자열로 */}
        성공! {typeof apiStatus.data === 'object' ? (apiStatus.data.message || JSON.stringify(apiStatus.data)) : apiStatus.data}
        </div>}
    </div>
  );
};

export default WillWritePage;