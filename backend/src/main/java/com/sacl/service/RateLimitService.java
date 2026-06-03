package com.sacl.service;

import com.sacl.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private static final int MAX_ATTEMPTS = 10;
    private static final long WINDOW_MS = 15 * 60 * 1000L; // 15 minutes

    private final ConcurrentHashMap<String, Deque<Long>> attempts = new ConcurrentHashMap<>();

    public void checkRateLimit(String ip) {
        long now = System.currentTimeMillis();
        attempts.compute(ip, (key, deque) -> {
            if (deque == null) deque = new ArrayDeque<>();
            // Remove entries older than 15 minutes
            while (!deque.isEmpty() && (now - deque.peekFirst()) > WINDOW_MS) {
                deque.pollFirst();
            }
            deque.addLast(now);
            return deque;
        });

        Deque<Long> deque = attempts.get(ip);
        if (deque != null && deque.size() > MAX_ATTEMPTS) {
            throw new BadRequestException("Too many login attempts. Please try again later.");
        }
    }
}
