<?php

/**
 * CHara Realty — app-specific settings.
 *
 * Future (not implemented): role-based access, HTTPS enforcement at edge.
 */
return [

    /*
    |--------------------------------------------------------------------------
    | Feature flags (future)
    |--------------------------------------------------------------------------
    */
    'roles_enabled' => (bool) env('CHARA_FEATURE_ROLES', false),

    /*
    |--------------------------------------------------------------------------
    | HTTPS (deployment)
    |--------------------------------------------------------------------------
    | When true, middleware / web server should redirect HTTP → HTTPS.
    | Not enforced in code here — configure Traefik, nginx, or Laravel TrustProxies.
    */
    'force_https' => (bool) env('CHARA_FORCE_HTTPS', false),

];
