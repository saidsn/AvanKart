import { decrypt } from './crypto.js'
import { createClient } from 'redis'
import { Buffer } from 'node:buffer'
import cookie from 'cookie'
import PeopleSession from '../../shared/model/people/peopleSessionModel.js'

function detectDeviceOS(userAgent = '') {
  if (/Android/i.test(userAgent)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS'
  if (/Windows NT/i.test(userAgent)) return 'Windows'
  if (/Mac OS X/i.test(userAgent)) return 'macOS'
  if (/Linux/i.test(userAgent)) return 'Linux'
  return 'Unknown'
}

const redisClient = createClient()
redisClient.on('error', err => console.error('Redis error:', err))
await redisClient.connect()

export const verifySocketConnection = async (socket, next) => {
  try {
    // 🍪 Cookie parse
    const cookies = cookie.parse(socket.handshake.headers.cookie || '')
    const sessionId = cookies.sessionId

    if (!sessionId) {
      return next(new Error('Session bulunamadı'))
    }

    // 🔐 Redis session çek
    const encryptedSession = await redisClient.get(`session:${sessionId}`)
    if (!encryptedSession) {
      return next(new Error('Oturum geçersiz'))
    }

    const { user } = decrypt(encryptedSession)

    // 📱 Device info
    const userAgent = socket.handshake.headers['user-agent'] || 'Unknown'
    let deviceOs = socket.handshake.headers['x-device-os'] || detectDeviceOS(userAgent)

    // 📦 Mongo session araması 
    const mongoSession = await PeopleSession.findOne({
      user_id: user.id,
      device_name: userAgent
    })

    if (!mongoSession) {
      console.warn(`⚠️ Socket Session kaydı bulunamadı`, {
        user_id: user.id,
        device_name: userAgent,
        device_os: deviceOs
      })
      return next(new Error('Session kaydı yok'))
    }

    if (!mongoSession.otp_verified) {
      return next(new Error('OTP doğrulaması yapılmadı'))
    }

    // ✅ Bağlantı güvenli - User bilgilerini socket'e ekle
    socket.user = {
      id: user.id,
      email: user.email,
      ...user
    }
    
    next()
  } catch (err) {
    console.error('Socket auth hatası:', err)
    return next(new Error('Yetkisiz bağlantı'))
  }
}