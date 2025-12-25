<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'title',
        'content',
        'source_url',
        'is_generated',
        'references',
        'original_article_id',
    ];

    protected $casts = [
        'is_generated' => 'boolean',
        'references' => 'array',
    ];

    public function original()
    {
        return $this->belongsTo(Article::class, 'original_article_id');
    }
}
