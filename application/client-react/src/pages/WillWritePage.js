import React, { useState, useEffect } from "react"; // useEffect 추가
import styled from "styled-components";
import { FaUpload } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import willService from '../services/willService';

// Styled-components 정의 (중복 제거 및 필요한 것만 남김)
const Container = styled.div`
  max-width: 960px;
  margin: 40px auto;
  padding: 24px;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
  margin-top: 0;
`;

const Subtitle = styled.div`
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 10px;
  margin-top: 0;
  letter-spacing: -0.01em;
`;

const StepProgress = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 48px;
  padding: 0 12px;

  &::before {
    content: "";
    position: absolute;
    top: 18px;
    left: 12px;
    right: 12px;
    height: 4px;
    background: #e5e7eb;
    z-index: 0;
    border-radius: 2px;
  }

  &::after {
    content: "";
    position: absolute;
    top: 18px;
    left: 12px;
    width: calc(((100% - 24px) / 3) * var(--progress)); /* 4단계이므로 3개의 구간 */
    height: 4px;
    background: #6366f1;
    z-index: 1;
    border-radius: 2px;
  }

  .step-item {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    cursor: default;

    .circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #e5e7eb;
      color: #666;
      font-weight: 700;
      line-height: 36px;
      text-align: center;
      margin-bottom: 8px;
      user-select: none;
    }

    &.active .circle {
      background-color: #6366f1;
      color: white;
    }

    .step-name {
      font-size: 14px;
      color: #666;
      user-select: none;
    }

    &.active .step-name {
      color: #111827;
      font-weight: 700;
    }
  }
`;

const Section = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
`;

const Label = styled.div`
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 24px;
`;

const InlineInputs = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  width: 100%; 
  box-sizing: border-box;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 200px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
  box-sizing: border-box;
`;

const UploadButton = styled.label`
  margin-top: 12px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #6366f1;
  background: transparent;
  color: #6366f1;
  transition: background-color 0.2s, color 0.2s;
  display: inline-block; 

  &:hover {
    background: #6366f1;
    color: white;
  }
`;

const UploadInput = styled.input`
  display: none;
`;

const UploadBoxLabel = styled.label`
  border: 1px dashed #ccc;
  padding: 32px;
  text-align: center;
  color: #777;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 20px;
    margin-bottom: 8px;
  }
`;

const FileNameList = styled.ul`
  margin-top: 12px;
  list-style: none;
  padding-left: 0;
  font-size: 14px;
  color: #444;
`;

const FileNameItem = styled.li`
`;

const FilePreviewArea = styled.div`
  margin-top: 16px;
`;

const PreviewTitle = styled.h4`
  font-size: 15px;
  margin-bottom: 8px;
  color: #333;
`;

const ViewerItem = styled.div`
  background: #f9fafb;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #111827;
`;

const AddViewerButton = styled.button`
  margin-top: 12px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #6366f1;
  background: transparent;
  color: #6366f1;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background: #6366f1;
    color: white;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-top: 12px;
  font-size: 14px;
  color: #111827;

  input {
    margin-right: 8px;
  }
`;

const ButtonWrap = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
  gap: 12px;
`;

const Button = styled.button`
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;

  &.save {
    background: transparent;
    border: 1px solid #6366f1;
    color: #6366f1;
  }
  &.save:hover {
    background: #6366f1;
    color: white;
  }
  &.submit {
    background: #6366f1;
    color: white;
    border: none;
  }
  &.submit:hover {
    background: #4f46e5;
  }
  &:disabled {
    background-color: #ccc;
    color: #666;
    cursor: not-allowed;
    border-color: #ccc;
  }
  &.submit:disabled:hover {
    background: #ccc;
  }
`;

const ApiMessage = styled.div`
  margin-top: 10px;
  text-align: center;
  font-size: 0.9em;
  &.error {
    color: red;
  }
  &.success {
    color: green;
  }
`;

// 상세 로직을 포함한 WillWritePage 컴포넌트
const WillWritePage = () => {
  const navigate = useNavigate();
  const [viewers, setViewers] = useState([]); // 초기 열람자 예시는 필요시 추가
  const [blockchain, setBlockchain] = useState(false);
  const [publicReq, setPublicReq] = useState(false);
  const [imageFilesToUpload, setImageFilesToUpload] = useState([]);
  const [content, setContent] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [willTitle, setWillTitle] = useState("");
  const [testatorDisplayRealName, setTestatorDisplayRealName] = useState("");
  const [sessionUsername, setSessionUsername] = useState("");
  const [isLoadingRealName, setIsLoadingRealName] = useState(true);
  const [apiStatus, setApiStatus] = useState({ loading: false, error: null, data: null });
  const [ocrInProgress, setOcrInProgress] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const [uploadedFileNames, setUploadedFileNames] = useState([]);

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
          setTestatorDisplayRealName(usernameFromSession);
          setIsLoadingRealName(false);
        });
    } else {
      setTestatorDisplayRealName("로그인 필요");
      setIsLoadingRealName(false);
      // navigate('/login'); // 필요시 로그인 페이지로 리다이렉트
    }
  }, []);

  const handleFileChange = async (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 0) {
      const updatedFilesToUpload = [...imageFilesToUpload, ...newFiles];
      const updatedFileNames = updatedFilesToUpload.map(f => f.name);
      setImageFilesToUpload(updatedFilesToUpload);
      setUploadedFileNames(updatedFileNames);

      const fileToProcessForOCR = newFiles[0];
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
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    if (value.trim() !== "" && currentStep < 2 && willTitle.trim() !== "" && testatorDisplayRealName.trim() !== "" && testatorDisplayRealName !== "로그인 필요") {
      setCurrentStep(2);
    }
  };
  
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setWillTitle(value);
    if (value.trim() !== "" && currentStep < 2 && content.trim() !== "" && testatorDisplayRealName.trim() !== "" && testatorDisplayRealName !== "로그인 필요") {
      setCurrentStep(2);
    }
  };

  const handleAddViewer = () => {
    const newViewer = { name: "새 열람자", desc: "관계", id: `0xNew...${Math.random().toString(16).slice(2,10)}` };
    setViewers(prev => Array.isArray(prev) ? [...prev.filter(v => v && v.name && v.id), newViewer] : [newViewer]);
    if (currentStep < 3 && willTitle.trim() !== "" && content.trim() !== "" && testatorDisplayRealName.trim() !== "" && testatorDisplayRealName !== "로그인 필요") {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    // "기존 코드"처럼 willTitle을 필수 항목으로 다시 검사합니다.
    if (!willTitle || !content || !sessionUsername || !testatorDisplayRealName || testatorDisplayRealName === "로그인 필요") {
      setApiStatus({ loading: false, error: "유언장 제목, 내용 및 작성자 정보(로그인 상태)는 필수 항목입니다.", data: null });
      return;
    }

    // 모든 필수 정보가 입력되었고, 현재 단계가 4단계 미만이면 4단계로 이동
    if (willTitle.trim() && content.trim() && sessionUsername && currentStep < 4) {
        setCurrentStep(4);
        return; // 4단계에서 다시 "작성 완료 및 제출" 버튼을 누르도록 유도
    }

    setApiStatus({ loading: true, error: null, data: null });

    const formData = new FormData();
    formData.append('title', willTitle); // title 전송 로직 복원
    formData.append('originalContent', content);
    const beneficiariesArray = Array.isArray(viewers) ? viewers.filter(v => v && v.name).map(v => v.name) : [];
    formData.append('beneficiaries', JSON.stringify(beneficiariesArray));
    formData.append('testatorId', sessionUsername);
    formData.append('blockchainEnabled', blockchain);
    formData.append('notarizationRequested', publicReq);

    if (imageFilesToUpload.length > 0) {
      imageFilesToUpload.forEach((file) => {
        formData.append('imageFiles', file, file.name);
      });
    }
    
    try {
      let response;
      if (imageFilesToUpload.length > 0) {
        response = await willService.registerWillWithImage(formData);
      } else {
        const textWillData = {
          title: willTitle, // title 전송 로직 복원
          originalContent: content,
          beneficiaries: beneficiariesArray,
          testatorId: sessionUsername,
          blockchainEnabled: blockchain,
          notarizationRequested: publicReq,
        };
        response = await willService.registerWill(textWillData);
      }
      
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
  
  const isSubmitDisabled = () => {
    if (apiStatus.loading) return true;
    // willTitle도 필수 항목으로 다시 검사합니다.
    if (!willTitle.trim() || !content.trim() || !sessionUsername || testatorDisplayRealName === "로그인 필요") {
        return true;
    }
    return false; 
  };

  return (
    <Container>
      <Title>디지털 유언장 작성</Title>
      <Subtitle>작성 진행 상태</Subtitle>
      <StepProgress style={{ "--progress": currentStep - 1 }}>
        <div className={`step-item ${currentStep >= 1 ? "active" : ""}`}>
          <div className="circle">1</div>
          <span className="step-name">기본 정보</span>
        </div>
        <div className={`step-item ${currentStep >= 2 ? "active" : ""}`}>
          <div className="circle">2</div>
          <span className="step-name">내용 작성</span>
        </div>
        <div className={`step-item ${currentStep >= 3 ? "active" : ""}`}>
          <div className="circle">3</div>
          <span className="step-name">열람자 지정</span>
        </div>
        <div className={`step-item ${currentStep >= 4 ? "active" : ""}`}>
          <div className="circle">4</div>
          <span className="step-name">최종 확인</span>
        </div>
      </StepProgress>

      <Section>
        <Label>기본 정보</Label>
        <InlineInputs>
          <Input placeholder="유언장 제목" value={willTitle} onChange={handleTitleChange} />
          <Input
            placeholder="작성자 이름 (자동 입력)"
            value={isLoadingRealName ? "실명 로딩 중..." : testatorDisplayRealName}
            readOnly
          />
        </InlineInputs>
      </Section>

      <Section>
        <Label>유언장 내용</Label>
        <TextArea
          placeholder="유언장 내용을 작성해주세요..."
          value={content}
          onChange={handleContentChange}
        />
      </Section>
      
      <Section>
        <Label>자필 문서 스캔 / 유언장 첨부 이미지 (선택사항, 여러 장 가능)</Label>
        <UploadBoxLabel htmlFor="handwritten-upload">
          <FaUpload />
          <div>
            이곳에 파일을 끌어다 놓거나 클릭하여 업로드하세요
            <br />
            (선택된 모든 이미지가 첨부됩니다. OCR은 새로 추가된 첫 번째 파일로 진행됩니다.)
            <br />
            지원 형식: JPG, PNG, WEBP 등 이미지 파일
          </div>
          <UploadInput
            id="handwritten-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </UploadBoxLabel>
        <UploadButton htmlFor="handwritten-upload">
          📎 문서/이미지 업로드하기
        </UploadButton>
        {ocrInProgress && <ApiMessage style={{ marginTop: '10px', textAlign: 'center' }}>첫 번째 이미지 OCR 처리 중...</ApiMessage>}
        {ocrError && <ApiMessage className="error" style={{ marginTop: '10px', textAlign: 'center' }}>OCR 오류: {ocrError}</ApiMessage>}
        
        {uploadedFileNames.length > 0 && (
          <FilePreviewArea>
            <PreviewTitle>선택된 파일:</PreviewTitle>
            <FileNameList>
              {uploadedFileNames.map((fileName, index) => (
                <FileNameItem key={index}>{fileName}</FileNameItem>
              ))}
            </FileNameList>
          </FilePreviewArea>
        )}
      </Section>
      
      <Section>
        <Label>열람자 지정</Label>
        {Array.isArray(viewers) && viewers.map((v, i) => (
          <ViewerItem key={i}>
            <div>
              {v.name} <span style={{ color: "#888" }}>– {v.desc}</span>
            </div>
            <div style={{ fontFamily: "monospace" }}>{v.id}</div>
          </ViewerItem>
        ))}
        <AddViewerButton onClick={handleAddViewer}>
          + 열람자 추가
        </AddViewerButton>
      </Section>

      <Section>
        <Label>고급 설정</Label>
        <CheckboxLabel>
          <input type="checkbox" checked={blockchain} onChange={(e) => setBlockchain(e.target.checked)} />
          블록체인 등록 활성화
        </CheckboxLabel>
        <CheckboxLabel>
          <input type="checkbox" checked={publicReq} onChange={(e) => setPublicReq(e.target.checked)} />
          공증 신청
        </CheckboxLabel>
      </Section>

      <ButtonWrap>
        <Button className="save">임시 저장</Button>
        <Button
            className="submit"
            onClick={handleSubmit}
            disabled={isSubmitDisabled()}
        >
          {apiStatus.loading ? "처리 중..." : (currentStep < 4 ? "내용 검토 및 최종 확인" : "작성 완료 및 제출")}
        </Button>
      </ButtonWrap>

      {apiStatus.error && <ApiMessage className="error" >오류: {apiStatus.error}</ApiMessage>}
    </Container>
  );
};

export default WillWritePage;