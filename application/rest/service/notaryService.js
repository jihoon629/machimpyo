// application/rest/service/notaryService.js
const pool = require('../db');

/**
 * 공증인 ID를 기반으로 NotaryDetails 정보를 생성하거나 업데이트합니다 (UPSERT).
 * @param {string} userId - Users 테이블의 공증인 ID (VARCHAR(36))
 * @param {object} detailsData - 저장할 상세 정보 객체
 * @returns {object} 생성 또는 업데이트된 NotaryDetails 정보 (또는 성공 메시지)
 */
async function upsertNotaryDetailsByUserId(userId, detailsData) {
    const {
        company_phone,
        consultation_phone,
        phone_consultation_fee,
        visit_consultation_fee,
        tags, // 배열 형태 ['태그1', '태그2']
        description
    } = detailsData;

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // tags 배열을 JSON 문자열로 변환 (DB에 JSON 타입으로 저장 시)
        // tags가 null이거나 빈 배열일 경우 DB에 NULL 또는 '[]'로 저장되도록 처리
        const tagsJson = (tags && Array.isArray(tags) && tags.length > 0) ? JSON.stringify(tags) : null;

        // 1. 기존 정보가 있는지 확인
        const [existingRows] = await connection.execute(
            'SELECT id FROM NotaryDetails WHERE user_id = ?',
            [userId]
        );

        let result;
        if (existingRows.length > 0) {
            // 정보가 이미 존재하면 업데이트
            const notaryDetailId = existingRows[0].id;
            console.log(`[NotaryService] Updating details for user_id: ${userId}, notary_detail_id: ${notaryDetailId}`);
            const [updateResult] = await connection.execute(
                `UPDATE NotaryDetails SET 
                    company_phone = ?, consultation_phone = ?, 
                    phone_consultation_fee = ?, visit_consultation_fee = ?, 
                    tags = ?, description = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [
                    company_phone || null,
                    consultation_phone || null,
                    phone_consultation_fee || null,
                    visit_consultation_fee || null,
                    tagsJson, // JSON 문자열 또는 null
                    description || null,
                    notaryDetailId
                ]
            );
            result = { id: notaryDetailId, user_id: userId, ...detailsData, tags: tags }; // 반환 시에는 다시 배열로
            console.log('[NotaryService] Details updated successfully, affectedRows:', updateResult.affectedRows);

        } else {
            // 정보가 없으면 새로 삽입
            console.log(`[NotaryService] Inserting new details for user_id: ${userId}`);
            const [insertResult] = await connection.execute(
                `INSERT INTO NotaryDetails 
                    (user_id, company_phone, consultation_phone, phone_consultation_fee, visit_consultation_fee, tags, description) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    company_phone || null,
                    consultation_phone || null,
                    phone_consultation_fee || null,
                    visit_consultation_fee || null,
                    tagsJson, // JSON 문자열 또는 null
                    description || null
                ]
            );
            result = { id: insertResult.insertId, user_id: userId, ...detailsData, tags: tags };
            console.log('[NotaryService] Details inserted successfully, new id:', insertResult.insertId);
        }

        await connection.commit();
        return result;

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('[NotaryService upsertNotaryDetailsByUserId Error]:', error.message, error.stack);
        // 특정 DB 오류 코드에 따라 다른 상태 코드나 메시지 반환 가능
        const serviceError = new Error('공증인 상세 정보 처리 중 오류가 발생했습니다.');
        serviceError.status = error.status || 500; // DB 오류에서 status가 없을 수 있음
        serviceError.cause = error;
        throw serviceError;
    } finally {
        if (connection) connection.release();
    }
}

/**
 * 사용자 ID (공증인)를 기반으로 NotaryDetails 정보를 조회합니다.
 * @param {string} userId - Users 테이블의 공증인 ID
 * @returns {object | null} NotaryDetails 정보 객체 또는 null (정보가 없을 경우)
 */
async function getNotaryDetailsByUserId(userId) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM NotaryDetails WHERE user_id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return null; // 정보 없음
        }

        const notaryDetail = rows[0];
        // tags가 JSON 문자열로 저장되어 있다면 다시 배열로 파싱
        if (notaryDetail.tags && typeof notaryDetail.tags === 'string') {
            try {
                notaryDetail.tags = JSON.parse(notaryDetail.tags);
            } catch (e) {
                console.error('[NotaryService getNotaryDetailsByUserId] Error parsing tags JSON:', e);
                notaryDetail.tags = []; // 파싱 오류 시 빈 배열로 처리
            }
        } else if (notaryDetail.tags === null || notaryDetail.tags === undefined) {
             notaryDetail.tags = []; // DB에 NULL이면 빈 배열로
        }
        // MariaDB/MySQL의 JSON 타입은 드라이버에 따라 이미 객체/배열로 반환될 수 있음. 이 경우 파싱 불필요.
        // 위 로직은 tags가 문자열로 반환된다고 가정. 실제 반환 타입을 보고 조정.

        return notaryDetail;

    } catch (error) {
        console.error('[NotaryService getNotaryDetailsByUserId Error]:', error.message, error.stack);
        const serviceError = new Error('공증인 상세 정보 조회 중 오류가 발생했습니다.');
        serviceError.status = 500;
        serviceError.cause = error;
        throw serviceError;
    } finally {
        if (connection) connection.release();
    }
}

/**
 * 공개용 공증인 프로필 정보를 사용자 ID 기반으로 조회합니다.
 * Users 테이블과 NotaryDetails 테이블을 조인하여 정보를 가져옵니다.
 * @param {string} userId - Users 테이블의 공증인 ID
 * @returns {object | null} 공증인 프로필 정보 객체 또는 null
 */
async function getPublicNotaryProfileByUserId(userId) {
    let connection;
    try {
        connection = await pool.getConnection();
        // Users 테이블에서 role='notary' 인 사용자만 조회하도록 조건 추가
        const query = `
            SELECT 
                u.id AS userId, 
                u.email, 
                u.name, 
                u.phone AS user_personal_phone, -- Users 테이블의 phone
                u.address AS company_main_address, -- Users 테이블의 address (회사 대표 주소로 사용)
                u.company_name, 
                u.registration_number,
                nd.id AS notary_detail_id,
                nd.company_phone, 
                nd.consultation_phone,
                nd.phone_consultation_fee,
                nd.visit_consultation_fee,
                nd.tags,
                nd.description,
                nd.created_at AS details_created_at,
                nd.updated_at AS details_updated_at
            FROM Users u
            LEFT JOIN NotaryDetails nd ON u.id = nd.user_id
            WHERE u.id = ? AND u.role = 'notary' 
        `;
        // LEFT JOIN: NotaryDetails 정보가 아직 없을 수도 있으므로 Users 정보는 항상 가져옴

        const [rows] = await connection.execute(query, [userId]);

        if (rows.length === 0) {
            return null; // 해당 ID의 공증인이 없거나, role이 notary가 아님
        }

        const profile = rows[0];

        // tags 처리 (getNotaryDetailsByUserId와 동일한 로직)
        if (profile.tags && typeof profile.tags === 'string') {
            try {
                profile.tags = JSON.parse(profile.tags);
            } catch (e) {
                console.error('[NotaryService getPublicNotaryProfileByUserId] Error parsing tags JSON:', e);
                profile.tags = [];
            }
        } else if (profile.tags === null || profile.tags === undefined) {
            profile.tags = [];
        }
        
        // 불필요하거나 민감한 정보 제거 (예: 사용자의 해시된 비밀번호 등은 SELECT하지 않음)
        // 위 쿼리에서는 이미 필요한 정보만 SELECT 하고 있음

        return profile;

    } catch (error) {
        console.error('[NotaryService getPublicNotaryProfileByUserId Error]:', error.message, error.stack);
        const serviceError = new Error('공개용 공증인 프로필 조회 중 오류가 발생했습니다.');
        serviceError.status = 500;
        serviceError.cause = error;
        throw serviceError;
    } finally {
        if (connection) connection.release();
    }
}

/**
 * (선택적 구현) 공개용 전체 공증인 목록을 조회합니다.
 * 페이지네이션, 검색, 필터링 등을 위한 options 객체를 받을 수 있습니다.
 */
async function getAllPublicNotariesList(options = {}) {
    // const { page = 1, limit = 10, searchTerm = '', tagsFilter = [] } = options;
    // const offset = (page - 1) * limit;
    let connection;
    try {
        connection = await pool.getConnection();
        // TODO: 검색어, 태그 필터, 페이지네이션을 적용한 동적 쿼리 구성 필요
        // 기본 목록 조회 (Users 정보와 NotaryDetails의 간단한 정보)
        const query = `
            SELECT 
                u.id AS userId, 
                u.name, 
                u.company_name,
                u.address AS company_main_address,
                nd.tags,
                SUBSTRING(nd.description, 1, 100) AS short_description -- 예시: 설명 앞부분만
                -- 필요한 다른 요약 정보 추가 가능
            FROM Users u
            LEFT JOIN NotaryDetails nd ON u.id = nd.user_id
            WHERE u.role = 'notary'
            -- AND (u.name LIKE ? OR u.company_name LIKE ? OR nd.description LIKE ?) -- 검색어 예시
            -- AND JSON_CONTAINS(nd.tags, ?) -- 태그 필터 예시 (단일 태그)
            -- ORDER BY u.name ASC -- 정렬 기준
            -- LIMIT ? OFFSET ? -- 페이지네이션
        `;
        // const searchPattern = searchTerm ? `%${searchTerm}%` : '%';
        // const params = [searchPattern, searchPattern, searchPattern, limit, offset];
        // 실제 파라미터 구성은 검색/필터 조건에 따라 달라짐

        // 우선 기본 목록만 가져오는 형태로 구현
        const [rows] = await connection.execute(query);

        const notaries = rows.map(notary => {
            if (notary.tags && typeof notary.tags === 'string') {
                try {
                    notary.tags = JSON.parse(notary.tags);
                } catch (e) { notary.tags = []; }
            } else if (notary.tags === null || notary.tags === undefined){
                notary.tags = [];
            }
            return notary;
        });
        
        // TODO: 전체 공증인 수 (필터링 적용된)를 구하는 쿼리도 필요 (페이지네이션을 위해)
        // const [[{totalNotaries}]] = await connection.execute('SELECT COUNT(*) as totalNotaries FROM Users WHERE role = \'notary\' /* + 필터 조건 */');

        // return { notaries, totalNotaries, page, limit };
        return notaries; // 우선 목록만 반환

    } catch (error) {
        console.error('[NotaryService getAllPublicNotariesList Error]:', error.message, error.stack);
        const serviceError = new Error('전체 공증인 목록 조회 중 오류가 발생했습니다.');
        serviceError.status = 500;
        serviceError.cause = error;
        throw serviceError;
    } finally {
        if (connection) connection.release();
    }
}


module.exports = {
    upsertNotaryDetailsByUserId,
    getNotaryDetailsByUserId,
    getPublicNotaryProfileByUserId,
    getAllPublicNotariesList, // 추가된 함수
};