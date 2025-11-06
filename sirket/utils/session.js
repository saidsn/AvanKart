import {v4 as uuidv4 } from 'uuid';
import { createClient } from 'redis';

export const createSession = async (user, req) => {
    const sessionId = uuidv4();
    const SECRET_KEY = process.env.SECRET_KEY;
    const fingerprint = `${req.ip}-${req.headers['user-agent']}-${SECRET_KEY}`;

    await redisClient.set(
        `session:${sessionId}`,
        JSON.stringify({ user, fingerprint }),
        { EX: 86400 } // 24 saat süre
    );
    
    return sessionId;
};