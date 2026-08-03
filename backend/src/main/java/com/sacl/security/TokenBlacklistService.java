package com.sacl.security;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory JWT blacklist.
 * Tokens are added on logout and automatically expired after their natural expiry.
 * For multi-instance deployments, replace with Redis.
 */
@Service
public class TokenBlacklistService {

    // token → expiry timestamp
    private final Map<String, Long> blacklist = new ConcurrentHashMap<>();

    public void blacklist(String token, Date expiry) {
        blacklist.put(token, expiry.getTime());
        evictExpired();
    }

    public boolean isBlacklisted(String token) {
        Long expiry = blacklist.get(token);
        if (expiry == null) return false;
        if (System.currentTimeMillis() > expiry) {
            blacklist.remove(token); // expired — clean up
            return false;
        }
        return true;
    }

    private void evictExpired() {
        long now = System.currentTimeMillis();
        blacklist.entrySet().removeIf(e -> now > e.getValue());
    }
}
