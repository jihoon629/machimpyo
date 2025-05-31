const pool = require('../db'); 
const { v4: uuidv4 } = require('uuid');

// 프로필 조회
async function getUserProfile(req, res) {
    const { username } = req.query;
    console.log('[요청] GET /mypage/profile → username:', username);

    if (!username) {
        console.log('[오류] username 누락');
        return res.status(400).json({ error: 'username 파라미터가 필요합니다.' });
    }

    try {
        const [rows] = await pool.execute(
            'SELECT username, name, phone, birth, address, gender, role FROM Users WHERE username = ?',
            [username]
          );
          

        console.log('[DB 결과] 사용자 정보:', rows);

        if (rows.length === 0) {
            return res.status(404).json({ error: '사용자 없음' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('[에러] getUserProfile 실패:', err);
        res.status(500).json({ error: '서버 오류' });
    }
}

// 비밀번호 수정
async function updateUserPassword(req, res) {
    const { username, currentPassword, newPassword } = req.body;
    console.log('[요청] POST /mypage/update-password →', req.body);

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'username, currentPassword, newPassword가 필요합니다.' });
    }

    try {
        // 현재 비밀번호 확인
        const [users] = await pool.execute(
            'SELECT * FROM Users WHERE username = ? AND password = ?',
            [username, currentPassword]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: '현재 비밀번호가 일치하지 않습니다.' });
        }

        // 비밀번호 업데이트
        const updateQuery = `UPDATE Users SET password = ? WHERE username = ?`;
        await pool.execute(updateQuery, [newPassword, username]);

        res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (err) {
        console.error('[에러] updateUserPassword 실패:', err);
        res.status(500).json({ error: '비밀번호 변경 실패' });
    }
}


// 전화번호 수정
async function updateUserProfile(req, res) {
    const { username, phone } = req.body;
    console.log('[요청] POST /mypage/update-profile →', req.body);

    if (!username || !phone) {
        return res.status(400).json({ error: 'username과 phone이 필요합니다.' });
    }

    try {
        const updateQuery = `UPDATE Users SET phone = ? WHERE username = ?`;
        const [result] = await pool.execute(updateQuery, [phone, username]);
        res.json({ message: '프로필이 성공적으로 수정되었습니다.' });
    } catch (err) {
        console.error('[에러] updateUserProfile 실패:', err);
        res.status(500).json({ error: '수정 실패' });
    }
}

async function updateUserProfileExtended(req, res) {
    const { username, address, gender, role } = req.body;
    console.log('[요청] POST /mypage/update-profile-extended →', req.body);

    if (!username) {
        return res.status(400).json({ error: 'username이 필요합니다.' });
    }

    try {
        const fields = [];
        const values = [];

        if (address !== undefined) {
            fields.push('address = ?');
            values.push(address);
        }
        if (gender !== undefined) {
            fields.push('gender = ?');
            values.push(gender);
        }
        if (role !== undefined) {
            fields.push('role = ?');
            values.push(role);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: '수정할 항목이 없습니다.' });
        }

        values.push(username);
        const query = `UPDATE Users SET ${fields.join(', ')} WHERE username = ?`;
        await pool.execute(query, values);

        res.json({ message: '프로필이 성공적으로 수정되었습니다.' });
    } catch (err) {
        console.error('[에러] updateUserProfileExtended 실패:', err);
        res.status(500).json({ error: '프로필 수정 실패' });
    }
}

// 전체 유저 목록 조회
async function getAllUsers(req, res) {
    try {
        const [rows] = await pool.execute('SELECT username, name, phone, birth, address, gender, role FROM Users');
        res.json(rows);
    } catch (err) {
        console.error('[에러] getAllUsers 실패:', err);
        res.status(500).json({ error: '불러오기 실패' });
    }
}


// 유언장 상태 등록
async function registerWillMeta(req, res) {
    const { will_id, status, viewers } = req.body;

    if (!will_id || !status) {
        return res.status(400).json({ error: 'will_id와 status는 필수입니다.' });
    }

    try {
        const id = uuidv4();
        const insertQuery = `
            INSERT INTO WillMeta (id, will_id, status, viewers)
            VALUES (?, ?, ?, ?)
        `;
        await pool.execute(insertQuery, [id, will_id, status, viewers || null]);
        res.status(201).json({ message: 'WillMeta 등록 성공', id });
    } catch (err) {
        console.error('[에러] registerWillMeta 실패:', err);
        res.status(500).json({ error: '등록 실패' });
    }
}

// 유언장 상태 목록 조회 (작성자 기준)
async function listWillMetaByUser(req, res) {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'username 파라미터 필요' });
    }

    try {
        const query = `
            SELECT wm.id, wm.will_id, wm.status, wm.viewers, wm.created_at
            FROM WillMeta wm
            JOIN Wills w ON wm.will_id = w.id
            WHERE w.testator_id = ?
            ORDER BY wm.created_at DESC
        `;
        const [rows] = await pool.execute(query, [username]);
        res.json(rows);
    } catch (err) {
        console.error('[에러] listWillMetaByUser 실패:', err);
        res.status(500).json({ error: '조회 실패' });
    }
}

module.exports = {
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    registerWillMeta,
    listWillMetaByUser,
    updateUserPassword,
    updateUserProfileExtended  
};
