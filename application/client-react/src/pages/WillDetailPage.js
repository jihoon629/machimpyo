import React from 'react';
import './css/WillDetailPagecss/WillDetailPage.css';

const WillDetailPage = () => {
  // 지정 열람자 데이터
  const readers = [
    { id: 1, name: '김미란', role: '배우자', status: '승인됨' },
    { id: 2, name: '김지훈', role: '자녀', status: '승인됨' },
    { id: 3, name: '김서연', role: '자녀', status: '대기중' },
  ];

  // 변경 이력 데이터
  const history = [
    { id: 1, date: '2023.11.20', action: '공증 완료' },
    { id: 2, date: '2023.11.15', action: '공증 신청' },
    { id: 3, date: '2023.10.20', action: '내용 수정' },
    { id: 4, date: '2023.10.15', action: '최초 작성' },
  ];

  // 첨부 문서 데이터
  const attachments = [
    { id: 1, name: '부동산등기부등본.pdf', size: '2.3MB' },
    { id: 2, name: '주식보유현황.pdf', size: '1.1MB' },
  ];

  return (
    <div className="wdp-page">
      {/* 헤더 카드 */}
      <div className="card header-card">
        {/* 1. 상단: 제목 / 배지 */}
        <div className="header-top">
          <h1 className="page-title">가족에게 남기는 마지막 이야기</h1>
          <span className="badge approved">
            <span className="icon">✔️</span>공증 완료
          </span>
        </div>

        {/* 2. 중단: 작성/수정일 / 액션 버튼 */}
        <div className="header-middle">
          <div className="subtitles">
            <span>작성일: 2023년 10월 15일</span>
            <span>최종 수정일: 2023년 11월 20일</span>
          </div>
          <div className="action-buttons">
            <button className="btn-outline purple">수정하기</button>
            <button className="btn-outline red">삭제하기</button>
          </div>
        </div>

        {/* 3. 하단: 메타 정보 */}
        <div className="header-meta">
          <div className="meta-item">
            <span className="icon">👤</span>열람자 {readers.length}명
          </div>
          <div className="meta-item">
            <span className="icon">🛡️</span>블록체인 보호됨
          </div>
          <div className="meta-item">
            <span className="icon">🔒</span>암호화 저장됨
          </div>
        </div>
      </div>

      {/* 본문 + 사이드바 */}
      <div className="content-wrap">
        <main className="wdp-main">
          {/* 유언장 내용 */}
          <div className="card content-card">
            <h2 className="card-title">유언장 내용</h2>
            <div className="card-body">
              <p>사랑하는 가족에게,</p>
              <p>
                이 유언장을 작성하며, 여러분 모두가 건강하고 행복한 삶을 살아가기를 바랍니다.
              </p>
              <ol className="will-list">
                <li>

                </li>
              </ol>
              <p>2023년 10월 15일</p>
            </div>
          </div>

          {/* 첨부 문서 */}
          <div className="card attachment-card">
            <h2 className="card-title">첨부 문서</h2>
            <ul className="attachment-list">
              {attachments.map(f => (
                <li key={f.id} className="attachment-item">
                  <span className="file-icon">📄</span>
                  <div className="file-info">
                    <span className="file-name">{f.name}</span>
                    <span className="file-size">{f.size}</span>
                  </div>
                  <button className="btn-icon">⬇️</button>
                </li>
              ))}
            </ul>
          </div>

          {/* 변경 이력 */}
          <div className="card history-card">
            <h2 className="card-title">변경 이력</h2>
            <ul className="history-list">
              {history.map(h => (
                <li key={h.id} className="history-item">
                  <span className="history-date">🕒 {h.date}</span>
                  <span className="history-action">{h.action}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>

        <aside className="wdp-sidebar">
          {/* 지정 열람자 */}
          <div className="card reader-card-wrapper">
            <div className="reader-header">
              <h2 className="card-title">지정 열람자</h2>
              <button className="btn-text">관리하기</button>
            </div>
            <ul className="reader-list">
              {readers.map(r => (
                <li key={r.id} className="reader-card">
                  <div className="reader-info">
                    <span className="reader-name">{r.name}</span>
                    <span className="reader-role">{r.role}</span>
                  </div>
                  <span
                    className={`reader-status ${
                      r.status === '승인됨' ? 'approved' : 'pending'
                    }`}
                  >
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 공증 상태 */}
          <div className="card proof-card">
            <h2 className="card-title">공증 상태</h2>
            <div className="proof-body">
              <span className="badge approved">
                <span className="icon">✔️</span>공증 완료
              </span>
              <div className="proof-info">
                <div>공증번호: <span>#23-1120-789</span></div>
                <div>공증일시: <span>2023년 11월 20일</span></div>
              </div>
              <button className="btn-download">공증서 다운로드 &gt;</button>
            </div>
          </div>

          {/* 보안 정보 */}
          <div className="card security-card">
            <h2 className="card-title">보안 정보</h2>
            <div className="security-details">
              <div>
                <strong>블록체인 해시</strong><span>baf3…e92f</span>
              </div>
              <div>
                <strong>암호화 방식</strong><span>AES-256</span>
              </div>
              <div>
                <strong>최종 백업</strong><span>5분 전</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default WillDetailPage;
