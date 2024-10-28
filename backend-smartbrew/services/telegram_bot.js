const TelegramBot = require('node-telegram-bot-api');
const db = require('../models'); // /models/index.js를 import
const { Op } = require('sequelize');
// BotFather로부터 받은 Telegram 봇 토큰
const token = process.env.TELEGRAM_ACCESS_TOKEN; // 여기서 'YOUR_TELEGRAM_BOT_TOKEN'을 실제 토큰으로 교체하세요.

// Telegram Bot 객체 생성
// const bot = new TelegramBot(token, { polling: true });

const bot = new TelegramBot(token);

const saveChatIdForUser = async (username, chatId) => {
    try {
        // 데이터베이스에서 해당 username의 사용자를 찾음
        const user = await db.User.findOne({ where: { username } });

        // 사용자가 존재할 경우 chatId를 업데이트
        if (user) {
            user.chatId = chatId; // chatId 업데이트
            await user.save(); // 변경 사항 저장
            console.log(`chatId 저장 완료 for username: ${username}`);
            return true;
        } else {
            console.log(`해당 username(${username})을 찾을 수 없습니다.`);
            return false;
        }
    } catch (error) {
        console.error('Error while saving chatId:', error);
        return false;
    }
};

// 새로운 사용자가 그룹에 추가될 때 환영 메시지 보내기
bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id;

    msg.new_chat_members.forEach((newUser) => {
        const userName = newUser.first_name || '사용자';
        const welcomeMessage = `안녕하세요, ${userName}! 등록을 위해 스마트양조에 가입하신 아이디를 입력해주세요! 😊`;
        bot.sendMessage(chatId, welcomeMessage);
    });
});

// '/start' 명령어 처리 (테스트용)
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        `
안녕하세요! 텔레그램 봇에 오신 것을 환영합니다.
등록을 위해 스마트양조에 가입하신 아이디를 입력해주세요! 😊
`,
    );
});

// 메시지 이벤트 처리
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.trim(); // 사용자가 입력한 텍스트

    // 사용자가 /start를 제외한 텍스트를 입력했을 때만 username으로 처리
    if (text !== '/start') {
        // 입력된 텍스트를 username으로 사용하고 chatId 저장 시도
        const success = await saveChatIdForUser(text, chatId);
        if (success) {
            bot.sendMessage(
                chatId,
                `성공적으로 chatId가 저장되었습니다. 환영합니다, ${text}!`,
            );
        } else {
            bot.sendMessage(
                chatId,
                `username '${text}'을 찾을 수 없습니다. 다시 시도해 주세요.`,
            );
        }
    }
});

const sendTelegramMessage = async (message) => {
    try {
        // User 테이블에서 모든 사용자 chatId 조회
        const users = await db.User.findAll({
            attributes: ['chatId'], // chatId만 가져옴
            where: {
                chatId: { [Op.ne]: null }, // chatId가 null이 아닌 사용자만 조회
            },
        });

        // 사용자에게 각각 메시지 전송
        for (const user of users) {
            const chatId = user.chatId;
            try {
                await bot.sendMessage(chatId, message); // 개별 chatId로 메시지 전송
                console.log(`Message sent to chatId: ${chatId}`);
            } catch (err) {
                console.error(
                    `Failed to send message to chatId ${chatId}:`,
                    err,
                );
            }
        }
    } catch (err) {
        console.error('Failed to send message to Telegram users:', err);
    }
};

module.exports = { sendTelegramMessage };
