const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { User } = require('../models'); // User 모델 가져오기

// 회원가입 페이지 렌더링
router.get('/register', (req, res) => {
    res.render('register', { error: null, showMenu: false, showHeaderFooter: false, layout: false });
});

// 로그인 페이지 렌더링
router.get('/login', (req, res) => {
    res.render('login', { error: null, showMenu: false, showHeaderFooter: false, layout: false });
});

// 회원가입 처리
router.post('/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    // 입력값 유효성 검사
    if (!username || !password || !confirmPassword) {
        return res.render('register', { error: 'All fields are required.', layout: false });
    }

    // 비밀번호 일치 확인
    if (password !== confirmPassword) {
        return res.render('register', { error: 'Passwords do not match.', layout: false });
    }

    try {
        // 사용자 이름 중복 확인
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.render('register', { error: 'Username already exists.', layout: false });
        }

        // 비밀번호 해시화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 새로운 사용자 추가 (원본 비밀번호와 해시된 비밀번호 모두 저장)
        await User.create({
            username,
            password, // 원본 비밀번호 저장
            hashedPassword // 해시된 비밀번호 저장
        });

        res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).render('register', { error: 'An error occurred during registration.', layout: false });
    }
});

// 로그인 페이지 렌더링
router.get('/login', (req, res) => {
    res.render('login', { error: null, layout: false });
});

// 로그인 처리
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 입력값 유효성 검사
    if (!username || !password) {
        return res.render('login', { error: 'Both username and password are required.', layout: false });
    }

    try {
        // 사용자 조회
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.render('login', { error: 'User not found.', layout: false });
        }

        // 비밀번호 검증
        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isPasswordValid) {
            return res.render('login', { error: 'Incorrect password.', layout: false });
        }

        // 세션에 사용자 정보 저장
        req.session.user = {
            id: user.id,
            username: user.username,
        };
        console.log('User logged in:', req.session.user);

        res.redirect('/dashboard'); // 로그인 후 대시보드로 이동
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).render('login', { error: 'An error occurred during login.', layout: false });
    }
});

// 로그아웃 처리
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).render('login', { error: 'Failed to logout.', layout: false });
        }
        res.redirect('/login');
    });
});

module.exports = router;
