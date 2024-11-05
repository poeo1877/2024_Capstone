const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); // nodemailer 추가
const crypto = require('crypto'); // 랜덤 토큰 생성에 사용
const { Op } = require('sequelize'); // Op 연산자 가져오기
const router = express.Router();
const { User } = require('../models'); // User 모델 가져오기

// Nodemailer 설정 (Gmail 사용)
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

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
	const { email, password } = req.body;

	if (!email || !password) {
		return res.render('register', { error: 'All fields are required.' });
	}

	try {
		const existingUser = await User.findOne({ where: { email } });
		if (existingUser) {
			return res.render('register', { error: 'Email already exists.' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		await User.create({
			email,
			password, // 원본 비밀번호 저장
			hashedPassword, // 해시된 비밀번호 저장
		});

		res.redirect('/login');
	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).render('register', { error: 'An error occurred during registration.', layout: false });
	}
});

// 로그인 처리
router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.render('login', { error: 'Both email and password are required.' });
	}

	try {
		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.render('login', { error: 'User not found.', layout: false });
		}

		const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
		if (!isPasswordValid) {
			return res.render('login', { error: 'Incorrect password.', layout: false });
		}

		req.session.user = {
			id: user.id,
			email: user.email,
		};
		res.redirect('/dashboard');
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).render('login', { error: 'An error occurred during login.', layout: false });
	}
});

// 비밀번호 찾기 페이지 렌더링
router.get('/forgot-password', (req, res) => {
	res.render('forgot-password', { error: null, showMenu: false, showHeaderFooter: false });
});

// 비밀번호 찾기 요청 처리 (이메일 전송)
router.post('/forgot-password', async (req, res) => {
	console.log('Forgot password form data:', req.body);
	const { email } = req.body;

	try {
		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.render('forgot-password', { error: 'User not found.', layout: false });
		}

		const token = crypto.randomBytes(20).toString('hex');
		const tokenExpiration = Date.now() + 3600000; // 1시간 유효한 토큰

		await user.update({ token, tokenExpiration });

		// 이메일에 Tracking Pixel 포함
		const mailOptions = {
			to: user.email,
			from: process.env.EMAIL_USER,
			subject: 'Password Reset',
			html: `You are receiving this because you (or someone else) have requested to reset your password.<br><br>
            Please click on the following link to complete the process:<br><br>
            <a href="http://${req.headers.host}/reset-password/${token}">Reset Password</a><br><br>
            If you did not request this, please ignore this email and your password will remain unchanged.<br><br>
            <img src="http://${req.headers.host}/tracking-pixel.png" alt="" width="1" height="1" />`, // 추적 픽셀 URL 수정
		};

		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				console.error('Error sending email:', err);
				return res.status(500).render('forgot-password', { error: 'An error occurred while sending the email.' });
			}
			console.log('Email sent successfully:', info);
			res.render('forgot-password', { message: 'Password reset email sent to ' + user.email });
		});
	} catch (error) {
		console.error('Error during forgot-password process:', error.message);
		console.error('Full error stack:', error.stack);
		res.status(500).render('forgot-password', { error: 'An internal error occurred. Please try again later.' });
	}
});

// 투명 픽셀 이미지 요청 처리
router.get('/tracking-pixel.png', (req, res) => {
	// 이메일이 읽혔을 때 로그 기록
	console.log('Tracking pixel requested - Email was read');

	// Content-Type을 이미지로 설정하고, 1x1 픽셀 투명 PNG 반환
	res.set('Content-Type', 'image/png');

	// PNG 파일 생성 (1x1 투명 픽셀)
	const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/eqrcBIAAAAASUVORK5CYII=', 'base64');
	res.send(buffer);
});

// 비밀번호 재설정 페이지 렌더링
router.get('/reset-password/:token', async (req, res) => {
	try {
		const user = await User.findOne({
			where: {
				token: req.params.token,
				tokenExpiration: { [Op.gt]: Date.now() },
			},
		});

		if (!user) {
			return res.render('forgot-password', { error: 'Password reset token is invalid or has expired.' });
		}

		res.render('reset-password', { token: req.params.token, showMenu: false, showHeaderFooter: false, layout: false });
	} catch (error) {
		console.error('Error:', error);
		res.status(500).render('forgot-password', { error: 'An error occurred.' });
	}
});

// 비밀번호 재설정 처리
router.post('/reset-password/:token', async (req, res) => {
	const { newPassword, confirmPassword } = req.body;

	// 비밀번호 일치 여부 확인
	if (newPassword !== confirmPassword) {
		return res.render('reset-password', { token: req.params.token, error: 'Passwords do not match.', showMenu: false, showHeaderFooter: false });
	}

	try {
		// 토큰을 통해 사용자 조회
		const user = await User.findOne({
			where: {
				token: req.params.token,
				tokenExpiration: { [Op.gt]: Date.now() },
			},
		});

		if (!user) {
			return res.render('forgot-password', { error: 'Password reset token is invalid or has expired.', showMenu: false, showHeaderFooter: false });
		}

		// 새로운 비밀번호가 기존 비밀번호와 같은지 확인
		const isSamePassword = await bcrypt.compare(newPassword, user.hashedPassword);
		if (isSamePassword) {
			return res.render('reset-password', {
				token: req.params.token,
				error: 'New password cannot be the same as the old password.',
				showMenu: false,
				showHeaderFooter: false,
			});
		}

		// 비밀번호 해시화 및 업데이트
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await user.update({ password: newPassword, hashedPassword, token: null, tokenExpiration: null });

		res.redirect('/login');
	} catch (error) {
		console.error('Error resetting password:', error);
		res.status(500).render('reset-password', { token: req.params.token, error: 'An error occurred. Please try again.', showMenu: false, showHeaderFooter: false });
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
