<?php

namespace App\Http\Support;

use Illuminate\Http\JsonResponse;

/**
 * Standard JSON envelope for the public API.
 *
 * Success: { "success": true, ...payload }
 * Errors:  handled globally (see bootstrap/app.php) as { "success": false, "message": "..." }
 */
final class ApiResponse
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public static function success(array $payload, int $status = 200): JsonResponse
    {
        return response()->json(array_merge(['success' => true], $payload), $status);
    }

    /**
     * @param  array<string, mixed>  $errors
     */
    public static function failure(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        $body = ['success' => false, 'message' => $message];
        if ($errors !== []) {
            $body['errors'] = $errors;
        }

        return response()->json($body, $status);
    }
}
