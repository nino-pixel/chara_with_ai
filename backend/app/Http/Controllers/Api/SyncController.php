<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Support\ApiResponse;
use App\Models\Client;
use App\Models\Deal;
use App\Models\Inquiry;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * One-time migration from SPA localStorage snapshot → MySQL (authenticated admin only).
 */
class SyncController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'properties' => 'nullable|array|max:5000',
            'inquiries' => 'nullable|array|max:5000',
            'clients' => 'nullable|array|max:5000',
            'transactionsByClient' => 'nullable|array|max:2000',
        ]);

        $counts = [
            'properties' => 0,
            'inquiries' => 0,
            'clients' => 0,
            'deals' => 0,
        ];

        DB::transaction(function () use ($payload, &$counts) {
            foreach ($payload['properties'] ?? [] as $row) {
                if (! is_array($row) || empty($row['id'])) {
                    continue;
                }
                $this->upsertProperty($row);
                $counts['properties']++;
            }

            foreach ($payload['clients'] ?? [] as $row) {
                if (! is_array($row) || empty($row['id'])) {
                    continue;
                }
                $this->upsertClient($row);
                $counts['clients']++;
            }

            foreach ($payload['inquiries'] ?? [] as $row) {
                if (! is_array($row) || empty($row['id'])) {
                    continue;
                }
                $this->upsertInquiry($row);
                $counts['inquiries']++;
            }

            foreach ($payload['transactionsByClient'] ?? [] as $clientId => $transactions) {
                if (! is_array($transactions)) {
                    continue;
                }
                foreach ($transactions as $tx) {
                    if (! is_array($tx) || empty($tx['id'])) {
                        continue;
                    }
                    $this->upsertDealFromTransaction((string) $clientId, $tx);
                    $counts['deals']++;
                }
            }
        });

        return ApiResponse::success([
            'ok' => true,
            'imported' => $counts,
        ]);
    }

    private function upsertProperty(array $p): void
    {
        $core = [
            'id', 'title', 'location', 'price', 'type', 'status', 'beds', 'baths', 'area', 'image',
            'showOnWebsite', 'archived',
        ];
        $extra = collect($p)->except($core)->filter(fn ($v) => $v !== null)->all();

        if (isset($extra['floorPlan']) && is_string($extra['floorPlan']) && str_starts_with($extra['floorPlan'], 'data:')) {
            unset($extra['floorPlan']);
        }

        Property::query()->updateOrCreate(
            ['id' => (string) $p['id']],
            [
                'title' => (string) ($p['title'] ?? ''),
                'location' => (string) ($p['location'] ?? ''),
                'price' => (string) ($p['price'] ?? ''),
                'type' => (string) ($p['type'] ?? 'House'),
                'status' => (string) ($p['status'] ?? 'draft'),
                'beds' => (int) ($p['beds'] ?? 0),
                'baths' => (int) ($p['baths'] ?? 0),
                'area' => (string) ($p['area'] ?? ''),
                'image' => (string) ($p['image'] ?? ''),
                'show_on_website' => (bool) ($p['showOnWebsite'] ?? true),
                'archived' => (bool) ($p['archived'] ?? false),
                'extra' => $extra,
            ]
        );
    }

    private function upsertClient(array $c): void
    {
        $core = [
            'id', 'name', 'email', 'phone', 'source', 'status', 'assignedTo', 'assigned_to',
        ];
        $extra = collect($c)->except($core)->filter(fn ($v) => $v !== null)->all();

        Client::query()->updateOrCreate(
            ['id' => (string) $c['id']],
            [
                'name' => (string) ($c['name'] ?? ''),
                'email' => (string) ($c['email'] ?? ''),
                'phone' => (string) ($c['phone'] ?? ''),
                'source' => isset($c['source']) ? (string) $c['source'] : null,
                'status' => (string) ($c['status'] ?? 'new'),
                'assigned_to' => $c['assigned_to'] ?? $c['assignedTo'] ?? null,
                'extra' => $extra,
            ]
        );
    }

    private function upsertInquiry(array $i): void
    {
        $meta = [
            'lostReason', 'source_auto', 'source_manual', 'utm_campaign', 'utm_medium',
            'linkedClientId', 'downpaymentPercent', 'highBuyingIntent',
        ];
        $metaData = [];
        foreach ($meta as $k) {
            if (array_key_exists($k, $i)) {
                $metaData[$k] = $i[$k];
            }
        }

        Inquiry::query()->updateOrCreate(
            ['id' => (string) $i['id']],
            [
                'name' => (string) ($i['name'] ?? ''),
                'email' => (string) ($i['email'] ?? ''),
                'phone' => (string) ($i['phone'] ?? ''),
                'property_id' => $i['propertyId'] ?? null,
                'property_title' => $i['propertyTitle'] ?? null,
                'message' => (string) ($i['message'] ?? ''),
                'status' => (string) ($i['status'] ?? 'new'),
                'priority' => $i['priority'] ?? null,
                'budget_range' => $i['budgetRange'] ?? null,
                'buying_timeline' => $i['buyingTimeline'] ?? null,
                'financing_method' => $i['financingMethod'] ?? null,
                'employment_status' => $i['employmentStatus'] ?? null,
                'estimated_monthly' => $i['estimatedMonthly'] ?? null,
                'downpayment' => $i['downpayment'] ?? null,
                'loan_term' => $i['loanTerm'] ?? null,
                'interest_rate' => $i['interestRate'] ?? null,
                'next_follow_up_at' => $i['nextFollowUpAt'] ?? null,
                'last_contacted_at' => $i['lastContactedAt'] ?? null,
                'notes' => $i['notes'] ?? null,
                'meta' => $metaData,
            ]
        );
    }

    private function upsertDealFromTransaction(string $clientId, array $tx): void
    {
        $pid = $tx['propertyId'] ?? '';
        if ($pid === '') {
            return;
        }

        $core = ['id', 'clientId', 'propertyId', 'property_id', 'status', 'amount', 'closingDate', 'closing_date'];
        $extra = collect($tx)->except($core)->filter(fn ($v) => $v !== null)->all();

        Deal::query()->updateOrCreate(
            ['id' => (string) $tx['id']],
            [
                'client_id' => $clientId,
                'property_id' => (string) $pid,
                'status' => (string) ($tx['status'] ?? 'Inquiry'),
                'amount' => isset($tx['amount']) ? (string) $tx['amount'] : null,
                'closing_date' => $tx['closingDate'] ?? $tx['closing_date'] ?? null,
                'extra' => $extra,
            ]
        );
    }
}
