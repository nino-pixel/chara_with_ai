<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'email',
        'phone',
        'source',
        'status',
        'assigned_to',
        'extra',
    ];

    protected function casts(): array
    {
        return [
            'extra' => 'array',
        ];
    }

    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class, 'client_id');
    }
}
